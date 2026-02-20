import { Select, NumberInput, Button, Stack, Alert, Text, Switch, Group, Divider, Badge, Card } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { IconInfoCircle, IconRotate } from '@tabler/icons-react';
import { PageHeader } from '../../components/common/PageHeader.tsx';
import { HelpIcon } from '../../components/common/HelpIcon.tsx';
import { LabelWithHelp } from '../../components/common/LabelWithHelp.tsx';
import { useRooms, useRadiators, createRadiator, updateRadiator, useSystemSettings } from '../../db/hooks.ts';
import { calculateRatedOutput, availableHeights, getRadiatorTypeName } from '../../data/reference/radiatorOutputs.ts';
import { valveTypes, findValveType } from '../../data/reference/valveKvTables.ts';
import type { RadiatorType } from '../../types/index.ts';

const schema = z.object({
  roomId: z.number().positive(),
  type: z.string().min(1),
  height: z.number().positive(),
  length: z.number().positive(),
  ratedOutputDeltaT50: z.number().positive(),
  valveType: z.string().optional(),
  valveDn: z.number().optional(),
});

type FormValues = z.infer<typeof schema>;

export function RadiatorEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId, radiatorId } = useParams();
  const isEdit = Boolean(radiatorId);
  const numProjectId = projectId ? Number(projectId) : undefined;
  const rooms = useRooms(numProjectId);
  const radiators = useRadiators(numProjectId);
  const systemSettings = useSystemSettings(numProjectId);
  const existing = radiators.find((r) => r.id === Number(radiatorId));
  const [manualOutput, setManualOutput] = useState(false);
  const [valveOverride, setValveOverride] = useState(false);

  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: {
      roomId: 0,
      type: '22',
      height: 600,
      length: 1000,
      ratedOutputDeltaT50: 0,
      valveType: undefined,
      valveDn: undefined,
    },
    validate: zodResolver(schema),
  });

  useEffect(() => {
    if (existing) {
      form.setValues({
        roomId: existing.roomId,
        type: existing.type,
        height: existing.height,
        length: existing.length,
        ratedOutputDeltaT50: existing.ratedOutputDeltaT50,
        valveType: existing.valveType,
        valveDn: existing.valveDn,
      });
      setValveOverride(existing.valveType !== undefined);
    } else if (rooms.length > 0 && !isEdit) {
      form.setFieldValue('roomId', rooms[0].id!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing, rooms]);

  // Auto-calculate rated output when type/height/length change
  const formValues = form.getValues();
  const autoOutput = useMemo(() => {
    return calculateRatedOutput(
      formValues.type as RadiatorType,
      formValues.height,
      formValues.length,
    );
  }, [formValues.type, formValues.height, formValues.length]);

  useEffect(() => {
    if (!manualOutput && autoOutput !== undefined) {
      form.setFieldValue('ratedOutputDeltaT50', autoOutput);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOutput, manualOutput]);

  // Calculate actual output at system temperatures
  const actualOutput = useMemo(() => {
    if (!systemSettings || !formValues.ratedOutputDeltaT50) return undefined;
    const roomTemp = 20; // default
    const deltaT_actual = (systemSettings.supplyTemp + systemSettings.returnTemp) / 2 - roomTemp;
    if (deltaT_actual <= 0) return 0;
    return Math.round(formValues.ratedOutputDeltaT50 * Math.pow(deltaT_actual / 50, 1.3));
  }, [formValues.ratedOutputDeltaT50, systemSettings]);

  const handleSubmit = async (values: FormValues) => {
    const data = {
      projectId: Number(projectId),
      roomId: values.roomId,
      type: values.type as RadiatorType,
      height: values.height,
      length: values.length,
      ratedOutputDeltaT50: values.ratedOutputDeltaT50,
      valveType: valveOverride ? values.valveType : undefined,
      valveDn: valveOverride ? values.valveDn : undefined,
    };

    if (isEdit && radiatorId) {
      await updateRadiator(Number(radiatorId), data);
    } else {
      await createRadiator(data);
    }
    navigate(`/project/${projectId}/radiators`);
  };

  const roomOptions = rooms.map((r) => ({
    value: String(r.id),
    label: r.name,
  }));

  const typeOptions: { value: string; label: string }[] = (
    ['10', '11', '20', '21', '22', '33'] as const
  ).map((v) => ({ value: v, label: getRadiatorTypeName(v) }));

  const heightOptions = availableHeights.map((h) => ({
    value: String(h),
    label: `${h} mm`,
  }));

  return (
    <>
      <PageHeader
        title={isEdit ? t('radiators.edit') : t('radiators.create')}
        backTo={`/project/${projectId}/radiators`}
      />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Select
            label={t('radiators.room')}
            data={roomOptions}
            required
            key={form.key('roomId')}
            value={String(formValues.roomId)}
            onChange={(val) => val && form.setFieldValue('roomId', Number(val))}
          />

          <Select
            label={<LabelWithHelp label={t('radiators.type')} required detail={t('help.radiatorType')} helpTitle={t('radiators.type')} />}
            data={typeOptions}
            required
            withAsterisk={false}
            key={form.key('type')}
            {...form.getInputProps('type')}
          />

          <Group grow>
            <Select
              label={t('radiators.height')}
              data={heightOptions}
              key={form.key('height')}
              value={String(formValues.height)}
              onChange={(val) => val && form.setFieldValue('height', Number(val))}
            />
            <NumberInput
              label={t('radiators.length')}
              suffix=" mm"
              min={100}
              step={100}
              key={form.key('length')}
              {...form.getInputProps('length')}
            />
          </Group>

          <Group>
            <Switch
              label={t('radiators.ratedOutputManual')}
              checked={manualOutput}
              onChange={(e) => setManualOutput(e.currentTarget.checked)}
            />
          </Group>

          <NumberInput
            label={<LabelWithHelp label={t('radiators.ratedOutput')} detail={t('help.ratedOutput')} helpTitle={t('radiators.ratedOutput')} />}
            suffix=" W"
            min={1}
            description={manualOutput ? t('radiators.ratedOutputManual') : t('radiators.ratedOutputAuto')}
            readOnly={!manualOutput}
            key={form.key('ratedOutputDeltaT50')}
            {...form.getInputProps('ratedOutputDeltaT50')}
          />

          {actualOutput !== undefined && (
            <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
              <Text size="sm">
                <Group gap={4} display="inline-flex">{t('radiators.actualOutput')}<HelpIcon tooltip={t('help.actualOutput')} /></Group>: <b>{actualOutput} W</b>
              </Text>
            </Alert>
          )}

          <Divider />

          <LabelWithHelp label={t('radiators.valve')} detail={t('help.radiatorValve')} helpTitle={t('radiators.valve')} />

          {!valveOverride ? (
            <Card shadow="xs" padding="sm" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Badge variant="light" color="gray" size="sm" mb={4}>{t('radiators.valveSystemDefault')}</Badge>
                  <Text size="sm">
                    {systemSettings ? `${findValveType(systemSettings.valveType)?.manufacturer ?? ''} ${findValveType(systemSettings.valveType)?.name ?? systemSettings.valveType} / DN${systemSettings.valveDn ?? 15}` : '—'}
                  </Text>
                </div>
                <Button variant="light" size="compact-sm" onClick={() => {
                  setValveOverride(true);
                  if (systemSettings) {
                    form.setFieldValue('valveType', systemSettings.valveType);
                    form.setFieldValue('valveDn', systemSettings.valveDn ?? 15);
                  }
                }}>
                  {t('radiators.valveOverride')}
                </Button>
              </Group>
            </Card>
          ) : (
            <Card shadow="xs" padding="sm" radius="md" withBorder>
              <Group grow mb="xs">
                <Select
                  label={t('system.valveType')}
                  size="xs"
                  data={valveTypes.map((v) => ({ value: v.id, label: `${v.manufacturer} ${v.name}` }))}
                  key={form.key('valveType')}
                  {...form.getInputProps('valveType')}
                />
                <Select
                  label={t('radiators.valveDn')}
                  size="xs"
                  data={[
                    { value: '10', label: 'DN10' },
                    { value: '15', label: 'DN15' },
                    { value: '20', label: 'DN20' },
                  ]}
                  value={String(formValues.valveDn ?? 15)}
                  onChange={(val) => val && form.setFieldValue('valveDn', Number(val))}
                />
              </Group>
              <Button
                variant="subtle"
                size="compact-xs"
                color="gray"
                leftSection={<IconRotate size={12} />}
                onClick={() => {
                  setValveOverride(false);
                  form.setFieldValue('valveType', undefined as unknown as string);
                  form.setFieldValue('valveDn', undefined as unknown as number);
                }}
              >
                {t('radiators.valveResetToDefault')}
              </Button>
            </Card>
          )}

          <Button type="submit" fullWidth>
            {t('common.save')}
          </Button>
        </Stack>
      </form>
    </>
  );
}
