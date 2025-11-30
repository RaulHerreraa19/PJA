import type { MantineColorsTuple } from '@mantine/core'

type TenStops = [string, string, string, string, string, string, string, string, string, string]

const buildShades = (values: TenStops): MantineColorsTuple => values

export const colimaBlue = buildShades([
  '#f0f5fb',
  '#dbe6f3',
  '#b3cbe3',
  '#88add2',
  '#6593c4',
  '#4d82bc',
  '#4079b8',
  '#3469a0',
  '#2c5d8e',
  '#1e476f',
])

export const colimaGold = buildShades([
  '#fff6ea',
  '#ffe9cb',
  '#ffd098',
  '#ffb460',
  '#f79e38',
  '#e88f24',
  '#d07f1a',
  '#ad6913',
  '#8c540f',
  '#623606',
])

export const colimaTeal = buildShades([
  '#e8faf8',
  '#c9efeb',
  '#95dfd8',
  '#5dccc2',
  '#32bcb1',
  '#17b1a6',
  '#0ca99e',
  '#009088',
  '#007a73',
  '#00554f',
])

export const neutralSlate = buildShades([
  '#f7f9fb',
  '#edf0f4',
  '#d8dde4',
  '#c0c8d3',
  '#aab6c5',
  '#9caaba',
  '#94a3b4',
  '#7e8c9b',
  '#6f7b87',
  '#5b646d',
])

export const statusGreen = buildShades([
  '#edfdf5',
  '#d2f7e2',
  '#a4edc5',
  '#70e1a5',
  '#45d68a',
  '#2fce79',
  '#21c96e',
  '#15a357',
  '#118348',
  '#0a562f',
])

export const statusRed = buildShades([
  '#fff1f1',
  '#ffd9d8',
  '#ffb2b1',
  '#f98584',
  '#ed5c5e',
  '#e24345',
  '#db3538',
  '#bd2527',
  '#9d1b1e',
  '#6f0c0f',
])

export const statusAmber = buildShades([
  '#fff8eb',
  '#ffecc5',
  '#ffda8b',
  '#ffc04f',
  '#f1a424',
  '#d98f0f',
  '#c98305',
  '#a16904',
  '#825304',
  '#563402',
])
