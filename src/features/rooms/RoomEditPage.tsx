import {
  TextInput,
  Select,
  NumberInput,
  Button,
  Stack,
  Card,
  Text,
  Group,
  ActionIcon,
  Divider,
  Alert,
  SegmentedControl,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo } from 'react';
import { z } from 'zod';
import { IconPlus, IconTrash, IconInfoCircle } from '@tabler/icons-react';
import { PageHeader } from '../../components/common/PageHeader.tsx';
import { HelpIcon } from '../../components/common/HelpIcon.tsx';
import { LabelWithHelp } from '../../components/common/LabelWithHelp.tsx';
import { useRoom, useProject, createRoom, updateRoom } from '../../db/hooks.ts';
import { getDefaultAirChangeRate } from '../../data/reference/airChangeRates.ts';
import { getDefaultRoomTemperature } from '../../data/reference/roomTemperatures.ts';
import { getDefaultUValue } from '../../data/reference/uValues.ts';
import type { RoomUsageType, FloorPosition, ComponentType, BuildingComponent } from '../../types/index.ts';

const windowSchema = z.object({
  id: z.string(),
  area: z.number().positive(),
  uValue: z.number().positive(),
  dimWidth: z.number().positive().optional(),
  dimHeight: z.number().positive().optional(),
});

const componentSchema = z.object({
  id: z.string(),
  type: z.string().min(1),
  area: z.number().positive(),
  uValue: z.number().positive(),
  adjacentTemp: z.number().nullable(),
  windows: z.array(windowSchema),
  dimWidth: z.number().positive().optional(),
  dimHeight: z.number().positive().optional(),
});

const schema = z.object({
  name: z.string().min(1),
  usageType: z.string().min(1),
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  floorPosition: z.string().min(1),
  desiredTemp: z.number(),
  airChangeRate: z.number().positive(),
  buildingComponents: z.array(componentSchema),
});

type FormValues = z.infer<typeof schema>;

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function RoomEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId, roomId } = useParams();
  const isEdit = Boolean(roomId);
  const existing = useRoom(roomId ? Number(roomId) : undefined);
  const project = useProject(projectId ? Number(projectId) : undefined);

  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      usageType: 'living_room',
      length: 4,
      width: 3,
      height: 2.5,
      floorPosition: 'upper',
      desiredTemp: 20,
      airChangeRate: 0.5,
      buildingComponents: [],
    },
    validate: zodResolver(schema),
  });

  useEffect(() => {
    if (existing) {
      form.setValues({
        name: existing.name,
        usageType: existing.usageType,
        length: existing.length,
        width: existing.width,
        height: existing.height,
        floorPosition: existing.floorPosition,
        desiredTemp: existing.desiredTemp,
        airChangeRate: existing.airChangeRate,
        buildingComponents: existing.buildingComponents,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  const handleUsageTypeChange = (value: string | null) => {
    if (value) {
      form.setFieldValue('usageType', value);
      form.setFieldValue('desiredTemp', getDefaultRoomTemperature(value as RoomUsageType));
      form.setFieldValue('airChangeRate', getDefaultAirChangeRate(value as RoomUsageType));
    }
  };

  const addComponent = () => {
    const ageClass = project?.buildingAgeClass ?? 'before_1978';
    const componentType: ComponentType = 'exterior_wall';
    form.insertListItem('buildingComponents', {
      id: generateId(),
      type: componentType,
      area: 10,
      uValue: getDefaultUValue(ageClass, componentType),
      adjacentTemp: null,
      windows: [],
      dimWidth: 4,
      dimHeight: 2.5,
    });
  };

  const addWindow = (componentIndex: number) => {
    const ageClass = project?.buildingAgeClass ?? 'before_1978';
    form.insertListItem(`buildingComponents.${componentIndex}.windows`, {
      id: generateId(),
      area: 1.5,
      uValue: getDefaultUValue(ageClass, 'window'),
      dimWidth: 1.2,
      dimHeight: 1.25,
    });
  };

  const handleComponentTypeChange = (index: number, value: string | null) => {
    if (value) {
      form.setFieldValue(`buildingComponents.${index}.type`, value);
      const ageClass = project?.buildingAgeClass ?? 'before_1978';
      form.setFieldValue(
        `buildingComponents.${index}.uValue`,
        getDefaultUValue(ageClass, value as ComponentType),
      );
      // Interior walls and ceilings get adjacent temp, exterior components don't
      if (value === 'interior_wall' || value === 'ceiling') {
        form.setFieldValue(`buildingComponents.${index}.adjacentTemp`, 15);
      } else {
        form.setFieldValue(`buildingComponents.${index}.adjacentTemp`, null);
      }
    }
  };

  const formValues = form.getValues();
  const area = formValues.length * formValues.width;
  const volume = area * formValues.height;

  // Calculate real-time transmission loss preview
  const transmissionPreview = useMemo(() => {
    if (!project) return 0;
    const designDeltaT = formValues.desiredTemp - project.designOutdoorTemp;
    let total = 0;
    for (const comp of formValues.buildingComponents) {
      const deltaT = comp.adjacentTemp !== null
        ? formValues.desiredTemp - comp.adjacentTemp
        : designDeltaT;
      // Net wall area = gross area - window areas
      const windowArea = comp.windows.reduce((sum: number, w: { area: number }) => sum + w.area, 0);
      const netArea = Math.max(0, comp.area - windowArea);
      total += comp.uValue * netArea * deltaT;
      // Windows
      for (const w of comp.windows) {
        total += w.uValue * w.area * deltaT;
      }
    }
    return Math.round(total);
  }, [formValues.buildingComponents, formValues.desiredTemp, project]);

  const ventilationPreview = useMemo(() => {
    if (!project) return 0;
    const deltaT = formValues.desiredTemp - project.designOutdoorTemp;
    return Math.round(0.34 * volume * formValues.airChangeRate * deltaT);
  }, [formValues.desiredTemp, formValues.airChangeRate, volume, project]);

  const handleSubmit = async (values: FormValues) => {
    const numProjectId = Number(projectId);
    const roomData = {
      projectId: numProjectId,
      name: values.name,
      usageType: values.usageType as RoomUsageType,
      length: values.length,
      width: values.width,
      height: values.height,
      floorPosition: values.floorPosition as FloorPosition,
      desiredTemp: values.desiredTemp,
      airChangeRate: values.airChangeRate,
      buildingComponents: values.buildingComponents as BuildingComponent[],
    };

    if (isEdit && roomId) {
      await updateRoom(Number(roomId), roomData);
    } else {
      await createRoom(roomData);
    }
    navigate(`/project/${projectId}/rooms`);
  };

  const usageTypeOptions = (
    ['living_room', 'bedroom', 'kitchen', 'bathroom', 'hallway', 'office', 'storage', 'wc'] as const
  ).map((v) => ({ value: v, label: t(`rooms.usageTypes.${v}`) }));

  const floorPositionOptions = (
    ['basement', 'ground', 'upper', 'top'] as const
  ).map((v) => ({ value: v, label: t(`rooms.floorPositions.${v}`) }));

  const componentTypeOptions = (
    ['exterior_wall', 'interior_wall', 'roof', 'floor', 'ceiling'] as const
  ).map((v) => ({ value: v, label: t(`rooms.componentTypes.${v}`) }));

  return (
    <>
      <PageHeader
        title={isEdit ? t('rooms.edit') : t('rooms.create')}
        backTo={`/project/${projectId}/rooms`}
      />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label={t('rooms.name')}
            placeholder={t('rooms.namePlaceholder')}
            required
            key={form.key('name')}
            {...form.getInputProps('name')}
          />

          <Select
            label={t('rooms.usageType')}
            data={usageTypeOptions}
            required
            key={form.key('usageType')}
            {...form.getInputProps('usageType')}
            onChange={handleUsageTypeChange}
          />

          <Text fw={500} size="sm">{t('rooms.dimensions')}</Text>

          <Group grow>
            <NumberInput
              label={t('rooms.length')}
              suffix=" m"
              min={0.1}
              step={0.1}
              decimalScale={2}
              key={form.key('length')}
              {...form.getInputProps('length')}
            />
            <NumberInput
              label={t('rooms.width')}
              suffix=" m"
              min={0.1}
              step={0.1}
              decimalScale={2}
              key={form.key('width')}
              {...form.getInputProps('width')}
            />
            <NumberInput
              label={t('rooms.height')}
              suffix=" m"
              min={1}
              step={0.1}
              decimalScale={2}
              key={form.key('height')}
              {...form.getInputProps('height')}
            />
          </Group>

          <Group gap="xl">
            <Text size="sm" c="dimmed">{t('rooms.area')}: <b>{area.toFixed(1)} m²</b></Text>
            <Text size="sm" c="dimmed">{t('rooms.volume')}: <b>{volume.toFixed(1)} m³</b></Text>
          </Group>

          <Select
            label={<LabelWithHelp label={t('rooms.floorPosition')} detail={t('help.floorPosition')} helpTitle={t('rooms.floorPosition')} />}
            data={floorPositionOptions}
            key={form.key('floorPosition')}
            {...form.getInputProps('floorPosition')}
          />

          <Group grow>
            <NumberInput
              label={<LabelWithHelp label={t('rooms.desiredTemp')} detail={t('help.desiredTemp')} helpTitle={t('rooms.desiredTemp')} />}
              suffix=" °C"
              step={0.5}
              key={form.key('desiredTemp')}
              {...form.getInputProps('desiredTemp')}
            />
            <NumberInput
              label={<LabelWithHelp label={t('rooms.airChangeRate')} detail={t('help.airChangeRate')} helpTitle={t('rooms.airChangeRate')} />}
              suffix=" 1/h"
              min={0.1}
              step={0.1}
              decimalScale={1}
              key={form.key('airChangeRate')}
              {...form.getInputProps('airChangeRate')}
            />
          </Group>

          <Divider />

          <Group justify="space-between">
            <Group gap={4}><Text fw={500}>{t('rooms.components')}</Text><HelpIcon detail={t('help.components')} title={t('rooms.components')} /></Group>
            <Button
              variant="light"
              size="compact-sm"
              leftSection={<IconPlus size={14} />}
              onClick={addComponent}
            >
              {t('rooms.addComponent')}
            </Button>
          </Group>

          {formValues.buildingComponents.map((component: FormValues['buildingComponents'][number], index: number) => (
            <Card key={component.id} shadow="xs" padding="sm" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Select
                  size="xs"
                  data={componentTypeOptions}
                  style={{ flex: 1 }}
                  key={form.key(`buildingComponents.${index}.type`)}
                  {...form.getInputProps(`buildingComponents.${index}.type`)}
                  onChange={(val) => handleComponentTypeChange(index, val)}
                />
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => form.removeListItem('buildingComponents', index)}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Group>

              <Group mb={4}>
                <SegmentedControl
                  size="xs"
                  value={component.dimWidth !== undefined ? 'dimensions' : 'area'}
                  onChange={(mode) => {
                    if (mode === 'dimensions') {
                      const h = formValues.height || 2.5;
                      const w = component.area > 0 ? Math.round((component.area / h) * 100) / 100 : 4;
                      form.setFieldValue(`buildingComponents.${index}.dimWidth`, w);
                      form.setFieldValue(`buildingComponents.${index}.dimHeight`, h);
                    } else {
                      form.setFieldValue(`buildingComponents.${index}.dimWidth`, undefined as unknown as number);
                      form.setFieldValue(`buildingComponents.${index}.dimHeight`, undefined as unknown as number);
                    }
                  }}
                  data={[
                    { label: t('rooms.dimMode'), value: 'dimensions' },
                    { label: t('rooms.areaMode'), value: 'area' },
                  ]}
                />
              </Group>

              {component.dimWidth !== undefined ? (
                <Group grow mb="xs">
                  <NumberInput
                    label={t('rooms.componentWidth')}
                    suffix=" m"
                    size="xs"
                    min={0.1}
                    step={0.1}
                    decimalScale={2}
                    value={component.dimWidth}
                    onChange={(val) => {
                      if (typeof val === 'number') {
                        form.setFieldValue(`buildingComponents.${index}.dimWidth`, val);
                        form.setFieldValue(`buildingComponents.${index}.area`, Math.round(val * (component.dimHeight ?? 2.5) * 100) / 100);
                      }
                    }}
                  />
                  <NumberInput
                    label={t('rooms.componentHeight')}
                    suffix=" m"
                    size="xs"
                    min={0.1}
                    step={0.1}
                    decimalScale={2}
                    value={component.dimHeight}
                    onChange={(val) => {
                      if (typeof val === 'number') {
                        form.setFieldValue(`buildingComponents.${index}.dimHeight`, val);
                        form.setFieldValue(`buildingComponents.${index}.area`, Math.round((component.dimWidth ?? 4) * val * 100) / 100);
                      }
                    }}
                  />
                  <NumberInput
                    label={t('rooms.componentArea')}
                    suffix=" m²"
                    size="xs"
                    readOnly
                    variant="filled"
                    decimalScale={2}
                    key={form.key(`buildingComponents.${index}.area`)}
                    {...form.getInputProps(`buildingComponents.${index}.area`)}
                  />
                </Group>
              ) : (
                <Group grow mb="xs">
                  <NumberInput
                    label={t('rooms.componentArea')}
                    suffix=" m²"
                    size="xs"
                    min={0.1}
                    step={0.1}
                    decimalScale={2}
                    key={form.key(`buildingComponents.${index}.area`)}
                    {...form.getInputProps(`buildingComponents.${index}.area`)}
                  />
                </Group>
              )}

              <Group grow mb="xs">
                <NumberInput
                  label={<LabelWithHelp label={t('rooms.componentUValue')} tooltip={t('help.uValue')} />}
                  suffix=" W/(m²·K)"
                  size="xs"
                  min={0.01}
                  step={0.01}
                  decimalScale={2}
                  key={form.key(`buildingComponents.${index}.uValue`)}
                  {...form.getInputProps(`buildingComponents.${index}.uValue`)}
                />
              </Group>

              {component.adjacentTemp !== null && (
                <NumberInput
                  label={<LabelWithHelp label={t('rooms.adjacentTemp')} tooltip={t('help.adjacentTemp')} />}
                  suffix=" °C"
                  size="xs"
                  step={0.5}
                  mb="xs"
                  key={form.key(`buildingComponents.${index}.adjacentTemp`)}
                  {...form.getInputProps(`buildingComponents.${index}.adjacentTemp`)}
                />
              )}

              {component.type === 'exterior_wall' && (
                <>
                  <Group justify="space-between" mt="xs" mb="xs">
                    <Text size="xs" fw={500}>{t('rooms.windows')}</Text>
                    <Button
                      variant="subtle"
                      size="compact-xs"
                      leftSection={<IconPlus size={12} />}
                      onClick={() => addWindow(index)}
                    >
                      {t('rooms.addWindow')}
                    </Button>
                  </Group>
                  {component.windows.map((window: FormValues['buildingComponents'][number]['windows'][number], wIndex: number) => (
                    <Card key={window.id} padding="xs" radius="sm" withBorder mb="xs" bg="gray.0">
                      <Group justify="space-between" mb={4}>
                        <SegmentedControl
                          size="xs"
                          value={window.dimWidth !== undefined ? 'dimensions' : 'area'}
                          onChange={(mode) => {
                            const prefix = `buildingComponents.${index}.windows.${wIndex}`;
                            if (mode === 'dimensions') {
                              const h = 1.25;
                              const w = window.area > 0 ? Math.round((window.area / h) * 100) / 100 : 1.2;
                              form.setFieldValue(`${prefix}.dimWidth`, w);
                              form.setFieldValue(`${prefix}.dimHeight`, h);
                            } else {
                              form.setFieldValue(`${prefix}.dimWidth`, undefined as unknown as number);
                              form.setFieldValue(`${prefix}.dimHeight`, undefined as unknown as number);
                            }
                          }}
                          data={[
                            { label: t('rooms.dimMode'), value: 'dimensions' },
                            { label: t('rooms.areaMode'), value: 'area' },
                          ]}
                        />
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="sm"
                          onClick={() => form.removeListItem(`buildingComponents.${index}.windows`, wIndex)}
                        >
                          <IconTrash size={12} />
                        </ActionIcon>
                      </Group>
                      <Group gap="xs">
                        {window.dimWidth !== undefined ? (
                          <>
                            <NumberInput
                              label={t('rooms.componentWidth')}
                              suffix=" m"
                              size="xs"
                              min={0.1}
                              step={0.1}
                              decimalScale={2}
                              style={{ flex: 1 }}
                              value={window.dimWidth}
                              onChange={(val) => {
                                if (typeof val === 'number') {
                                  const prefix = `buildingComponents.${index}.windows.${wIndex}`;
                                  form.setFieldValue(`${prefix}.dimWidth`, val);
                                  form.setFieldValue(`${prefix}.area`, Math.round(val * (window.dimHeight ?? 1.25) * 100) / 100);
                                }
                              }}
                            />
                            <NumberInput
                              label={t('rooms.componentHeight')}
                              suffix=" m"
                              size="xs"
                              min={0.1}
                              step={0.1}
                              decimalScale={2}
                              style={{ flex: 1 }}
                              value={window.dimHeight}
                              onChange={(val) => {
                                if (typeof val === 'number') {
                                  const prefix = `buildingComponents.${index}.windows.${wIndex}`;
                                  form.setFieldValue(`${prefix}.dimHeight`, val);
                                  form.setFieldValue(`${prefix}.area`, Math.round((window.dimWidth ?? 1.2) * val * 100) / 100);
                                }
                              }}
                            />
                            <NumberInput
                              label={t('rooms.windowArea')}
                              suffix=" m²"
                              size="xs"
                              readOnly
                              variant="filled"
                              decimalScale={2}
                              style={{ flex: 1 }}
                              key={form.key(`buildingComponents.${index}.windows.${wIndex}.area`)}
                              {...form.getInputProps(`buildingComponents.${index}.windows.${wIndex}.area`)}
                            />
                          </>
                        ) : (
                          <NumberInput
                            label={t('rooms.windowArea')}
                            suffix=" m²"
                            size="xs"
                            min={0.1}
                            step={0.1}
                            decimalScale={2}
                            style={{ flex: 1 }}
                            key={form.key(`buildingComponents.${index}.windows.${wIndex}.area`)}
                            {...form.getInputProps(`buildingComponents.${index}.windows.${wIndex}.area`)}
                          />
                        )}
                        <NumberInput
                          label={t('rooms.windowUValue')}
                          suffix=" W/(m²·K)"
                          size="xs"
                          min={0.1}
                          step={0.01}
                          decimalScale={2}
                          style={{ flex: 1 }}
                          key={form.key(`buildingComponents.${index}.windows.${wIndex}.uValue`)}
                          {...form.getInputProps(`buildingComponents.${index}.windows.${wIndex}.uValue`)}
                        />
                      </Group>
                    </Card>
                  ))}
                </>
              )}
            </Card>
          ))}

          <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
            <Group gap="xl">
              <Text size="sm"><Group gap={4} display="inline-flex">{t('rooms.transmissionLoss')}<HelpIcon tooltip={t('help.transmissionLoss')} /></Group>: <b>{transmissionPreview} W</b></Text>
              <Text size="sm"><Group gap={4} display="inline-flex">{t('rooms.ventilationLoss')}<HelpIcon tooltip={t('help.ventilationLoss')} /></Group>: <b>{ventilationPreview} W</b></Text>
              <Text size="sm" fw={700}>
                <Group gap={4} display="inline-flex">{t('rooms.totalHeatingLoad')}<HelpIcon tooltip={t('help.heatingLoad')} /></Group>: {transmissionPreview + ventilationPreview} W
              </Text>
            </Group>
          </Alert>

          <Button type="submit" fullWidth>
            {t('common.save')}
          </Button>
        </Stack>
      </form>
    </>
  );
}
