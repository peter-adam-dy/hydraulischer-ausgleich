import { NumberInput, Select, Button, Stack, Text, Group } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { z } from 'zod';
import { PageHeader } from '../../components/common/PageHeader.tsx';
import { HelpIcon } from '../../components/common/HelpIcon.tsx';
import { LabelWithHelp } from '../../components/common/LabelWithHelp.tsx';
import { useSystemSettings, updateSystemSettings } from '../../db/hooks.ts';
import { valveTypes } from '../../data/reference/valveKvTables.ts';

const schema = z.object({
  supplyTemp: z.number().min(30).max(90),
  returnTemp: z.number().min(20).max(80),
  valveType: z.string().min(1),
  valveDn: z.number().min(10).max(20),
  specificPressureLoss: z.number().positive(),
});

type FormValues = z.infer<typeof schema>;

export function SystemSettingsPage() {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const settings = useSystemSettings(projectId ? Number(projectId) : undefined);

  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: {
      supplyTemp: 70,
      returnTemp: 55,
      valveType: 'danfoss_ra_n',
      valveDn: 15,
      specificPressureLoss: 120,
    },
    validate: zodResolver(schema),
  });

  useEffect(() => {
    if (settings) {
      form.setValues({
        supplyTemp: settings.supplyTemp,
        returnTemp: settings.returnTemp,
        valveType: settings.valveType,
        valveDn: settings.valveDn ?? 15,
        specificPressureLoss: settings.specificPressureLoss,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const handleSubmit = async (values: FormValues) => {
    if (projectId) {
      await updateSystemSettings(Number(projectId), values);
    }
  };

  const valveTypeOptions = valveTypes.map((v) => ({
    value: v.id,
    label: `${v.manufacturer} ${v.name}`,
  }));

  const formValues = form.getValues();
  const spread = formValues.supplyTemp - formValues.returnTemp;

  return (
    <>
      <PageHeader title={t('system.title')} backTo={`/project/${projectId}`} />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <NumberInput
            label={<LabelWithHelp label={t('system.supplyTemp')} detail={t('help.supplyTemp')} helpTitle={t('system.supplyTemp')} />}
            suffix=" °C"
            min={30}
            max={90}
            step={1}
            key={form.key('supplyTemp')}
            {...form.getInputProps('supplyTemp')}
          />

          <NumberInput
            label={<LabelWithHelp label={t('system.returnTemp')} detail={t('help.returnTemp')} helpTitle={t('system.returnTemp')} />}
            suffix=" °C"
            min={20}
            max={80}
            step={1}
            key={form.key('returnTemp')}
            {...form.getInputProps('returnTemp')}
          />

          <Text size="sm" c="dimmed">
            <Group gap={4} display="inline-flex">Spreizung: {spread} K<HelpIcon tooltip={t('help.spread')} /></Group>
          </Text>

          <Group grow>
            <Select
              label={<LabelWithHelp label={t('system.valveType')} detail={t('help.valveType')} helpTitle={t('system.valveType')} />}
              data={valveTypeOptions}
              key={form.key('valveType')}
              {...form.getInputProps('valveType')}
            />
            <Select
              label={<LabelWithHelp label={t('system.valveDn')} detail={t('help.valveDn')} helpTitle={t('system.valveDn')} />}
              data={[
                { value: '10', label: 'DN10' },
                { value: '15', label: 'DN15' },
                { value: '20', label: 'DN20' },
              ]}
              value={String(formValues.valveDn)}
              onChange={(val) => val && form.setFieldValue('valveDn', Number(val))}
            />
          </Group>

          <NumberInput
            label={<LabelWithHelp label={t('system.specificPressureLoss')} detail={t('help.specificPressureLoss')} helpTitle={t('system.specificPressureLoss')} />}
            suffix=" Pa/m"
            min={50}
            max={300}
            step={10}
            key={form.key('specificPressureLoss')}
            {...form.getInputProps('specificPressureLoss')}
          />

          <Button type="submit" fullWidth>
            {t('common.save')}
          </Button>
        </Stack>
      </form>
    </>
  );
}
