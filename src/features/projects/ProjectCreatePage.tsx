import { TextInput, Select, NumberInput, Button, Stack } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { z } from 'zod';
import { PageHeader } from '../../components/common/PageHeader.tsx';
import { LabelWithHelp } from '../../components/common/LabelWithHelp.tsx';
import { useProject, createProject, updateProject } from '../../db/hooks.ts';
import { climateZones, findClimateZone } from '../../data/reference/climateZones.ts';
import type { BuildingType, BuildingAgeClass } from '../../types/index.ts';

const schema = z.object({
  name: z.string().min(1),
  buildingType: z.string().min(1),
  buildingAgeClass: z.string().min(1),
  climateZoneId: z.string().min(1),
  designOutdoorTemp: z.number(),
});

type FormValues = z.infer<typeof schema>;

export function ProjectCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const isEdit = Boolean(projectId);
  const existing = useProject(projectId ? Number(projectId) : undefined);

  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      buildingType: 'apartment',
      buildingAgeClass: 'before_1978',
      climateZoneId: 'berlin',
      designOutdoorTemp: -13,
    },
    validate: zodResolver(schema),
  });

  useEffect(() => {
    if (existing) {
      form.setValues({
        name: existing.name,
        buildingType: existing.buildingType,
        buildingAgeClass: existing.buildingAgeClass,
        climateZoneId: existing.climateZoneId,
        designOutdoorTemp: existing.designOutdoorTemp,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  const handleClimateZoneChange = (value: string | null) => {
    if (value) {
      form.setFieldValue('climateZoneId', value);
      const zone = findClimateZone(value);
      if (zone) {
        form.setFieldValue('designOutdoorTemp', zone.designOutdoorTemp);
      }
    }
  };

  const handleSubmit = async (values: FormValues) => {
    if (isEdit && projectId) {
      await updateProject(Number(projectId), {
        name: values.name,
        buildingType: values.buildingType as BuildingType,
        buildingAgeClass: values.buildingAgeClass as BuildingAgeClass,
        climateZoneId: values.climateZoneId,
        designOutdoorTemp: values.designOutdoorTemp,
      });
      navigate(`/project/${projectId}/building`);
    } else {
      const id = await createProject({
        name: values.name,
        buildingType: values.buildingType as BuildingType,
        buildingAgeClass: values.buildingAgeClass as BuildingAgeClass,
        climateZoneId: values.climateZoneId,
        designOutdoorTemp: values.designOutdoorTemp,
      });
      navigate(`/project/${id}/building`);
    }
  };

  const buildingTypeOptions = (
    ['apartment', 'detached', 'semi_detached', 'terraced'] as const
  ).map((v) => ({ value: v, label: t(`building.types.${v}`) }));

  const ageClassOptions = (
    ['before_1978', '1979_1983', '1984_1994', '1995_2001', '2002_2009', '2010_2015', 'after_2016'] as const
  ).map((v) => ({ value: v, label: t(`building.ageClasses.${v}`) }));

  const climateZoneOptions = climateZones.map((z) => ({
    value: z.id,
    label: `${z.city} (${z.state})`,
  }));

  return (
    <>
      <PageHeader
        title={isEdit ? t('projects.edit') : t('projects.create')}
        backTo={isEdit ? `/project/${projectId}/building` : '/'}
      />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label={t('projects.name')}
            placeholder={t('projects.namePlaceholder')}
            required
            key={form.key('name')}
            {...form.getInputProps('name')}
          />

          <Select
            label={<LabelWithHelp label={t('building.type')} required tooltip={t('help.buildingType')} />}
            data={buildingTypeOptions}
            required
            withAsterisk={false}
            key={form.key('buildingType')}
            {...form.getInputProps('buildingType')}
          />

          <Select
            label={<LabelWithHelp label={t('building.ageClass')} required detail={t('help.ageClass')} helpTitle={t('building.ageClass')} />}
            data={ageClassOptions}
            required
            withAsterisk={false}
            key={form.key('buildingAgeClass')}
            {...form.getInputProps('buildingAgeClass')}
          />

          <Select
            label={<LabelWithHelp label={t('building.climateZone')} required tooltip={t('help.climateZone')} />}
            data={climateZoneOptions}
            searchable
            required
            withAsterisk={false}
            key={form.key('climateZoneId')}
            {...form.getInputProps('climateZoneId')}
            onChange={handleClimateZoneChange}
          />

          <NumberInput
            label={<LabelWithHelp label={t('building.designOutdoorTemp')} detail={t('help.designOutdoorTemp')} helpTitle={t('building.designOutdoorTemp')} />}
            suffix=" °C"
            step={0.5}
            key={form.key('designOutdoorTemp')}
            {...form.getInputProps('designOutdoorTemp')}
          />

          <Button type="submit" fullWidth>
            {t('common.save')}
          </Button>
        </Stack>
      </form>
    </>
  );
}
