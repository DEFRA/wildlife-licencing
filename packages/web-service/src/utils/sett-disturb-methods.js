import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
const {
  METHOD_IDS: { OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF, OBSTRUCT_SETT_WITH_GATES, DAMAGE_A_SETT, DESTROY_A_SETT, DISTURB_A_SETT }
} = PowerPlatformKeys

export const settDistruptionMethods = [
  {
    value: OBSTRUCT_SETT_WITH_GATES,
    text: 'Obstructing sett entrances by means of one-way badger gates'
  },
  {
    value: OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF,
    text: 'Obstructing access to sett entrances by blocking or proofing'
  },
  {
    value: DAMAGE_A_SETT,
    text: 'Damaging a sett by hand and mechanical means'
  },
  {
    value: DESTROY_A_SETT,
    text: 'Destruction of the vacant sett by hand and mechanical means'
  },
  {
    value: DISTURB_A_SETT,
    text: 'Disturbance of badgers'
  }
]
