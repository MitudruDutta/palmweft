import type { Sense } from '@ce/protocol';

export type CheckState = 'done' | 'pending' | 'failed';

export interface CheckStep {
  label: 'Generated' | 'Checked' | 'Sent' | 'Heard' | 'Seen' | 'Wired';
  state: CheckState;
}

export interface CheckProgress {
  generated: boolean;
  checked: boolean;
  sent: boolean;
  checkFailed?: boolean;
  sendFailed?: boolean;
  sense?: Sense;
  observation?: { sense: Sense; pass: boolean };
}

/** Preserve each stage's result independently, including progress completed before a later failure. */
export function buildCheckSteps(progress: CheckProgress): CheckStep[] {
  const { generated, checked, sent, checkFailed, sendFailed, observation } = progress;
  const sense = observation?.sense ?? progress.sense;
  return [
    { label: 'Generated', state: generated ? 'done' : 'pending' },
    { label: 'Checked', state: checkFailed ? 'failed' : checked ? 'done' : 'pending' },
    { label: 'Sent', state: sendFailed ? 'failed' : sent ? 'done' : 'pending' },
    {
      label: !sense || sense === 'camera' ? 'Seen' : sense === 'audio' ? 'Heard' : 'Wired',
      state: observation ? observation.pass ? 'done' : 'failed' : 'pending',
    },
  ];
}
