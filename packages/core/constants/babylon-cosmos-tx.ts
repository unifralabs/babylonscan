import { BinaryReader, BinaryWriter } from 'interchain-query'
import { Coin, CoinAmino } from 'interchain-query/cosmos/base/v1beta1/coin'
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgUndelegate,
} from 'interchain-query/cosmos/staking/v1beta1/tx'
import { DeepPartial, Exact, isSet } from 'interchain-query/helpers'
import { Any } from 'cosmjs-types/google/protobuf/any'

export const BABYLON_WRAPPED_MSG = {
  delegate: '/babylon.epoching.v1.MsgWrappedDelegate',
  beginRedelegate: '/babylon.epoching.v1.MsgWrappedBeginRedelegate',
  undelegate: '/babylon.epoching.v1.MsgWrappedUndelegate',
  submitProposal: '/cosmos.gov.v1.MsgSubmitProposal',
}

// Delegate protobuf type
export interface MsgBabylonDelegate {
  msg: MsgDelegate
}

function createBaseMsgDelegate(): MsgBabylonDelegate {
  return {
    msg: {
      delegatorAddress: '',
      validatorAddress: '',
      amount: Coin.fromPartial({}),
    },
  }
}

export const MsgBabylonDelegate = {
  typeUrl: BABYLON_WRAPPED_MSG.delegate,
  encode(
    message: MsgBabylonDelegate,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.msg !== undefined) {
      MsgDelegate.encode(message.msg, writer.uint32(10).fork()).ldelim()
    }
    return writer
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgBabylonDelegate {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input)
    const end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseMsgDelegate()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break
          }

          message.msg = MsgDelegate.decode(reader, reader.uint32())
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skip(tag & 7)
    }
    return message
  },
  fromJSON(object: any): MsgBabylonDelegate {
    const obj = createBaseMsgDelegate()
    if (isSet(object.delegatorAddress))
      obj.msg.delegatorAddress = String(object.delegatorAddress)
    if (isSet(object.validatorAddress))
      obj.msg.validatorAddress = String(object.validatorAddress)
    if (isSet(object.amount)) obj.msg.amount = Coin.fromJSON(object.amount)
    return obj
  },
  toJSON(message: MsgBabylonDelegate): unknown {
    const obj: any = { msg: {} }
    message.msg.delegatorAddress !== undefined &&
      (obj.msg.delegatorAddress = message.msg.delegatorAddress)
    message.msg.validatorAddress !== undefined &&
      (obj.msg.validatorAddress = message.msg.validatorAddress)
    message.msg.amount !== undefined &&
      (obj.msg.amount = message.msg.amount
        ? Coin.toJSON(message.msg.amount)
        : undefined)
    return obj
  },
  fromPartial<I extends Exact<DeepPartial<MsgBabylonDelegate>, I>>(
    object: I,
  ): MsgBabylonDelegate {
    const message = createBaseMsgDelegate()
    message.msg.delegatorAddress = object?.msg?.delegatorAddress ?? ''
    message.msg.validatorAddress = object?.msg?.validatorAddress ?? ''
    if (object?.msg?.amount !== undefined && object?.msg?.amount !== null) {
      message.msg.amount = Coin.fromPartial(object.msg.amount)
    }
    return message
  },
}

// Redelegate protobuf type
export interface MsgBabylonRedelegate {
  msg: MsgBeginRedelegate
}

function createBaseMsgBeginRedelegate(): MsgBabylonRedelegate {
  return {
    msg: {
      delegatorAddress: '',
      validatorSrcAddress: '',
      validatorDstAddress: '',
      amount: Coin.fromPartial({}),
    },
  }
}

export const MsgBabylonRedelegate = {
  typeUrl: BABYLON_WRAPPED_MSG.beginRedelegate,
  encode(
    message: MsgBabylonRedelegate,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.msg !== undefined) {
      MsgBeginRedelegate.encode(message.msg, writer.uint32(10).fork()).ldelim()
    }
    return writer
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgBabylonRedelegate {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input)
    const end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseMsgBeginRedelegate()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break
          }

          message.msg = MsgBeginRedelegate.decode(reader, reader.uint32())
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skip(tag & 7)
    }
    return message
  },
  fromJSON(object: any): MsgBabylonRedelegate {
    const obj = createBaseMsgBeginRedelegate()
    if (isSet(object?.msg?.delegatorAddress))
      obj.msg.delegatorAddress = String(object?.msg?.delegatorAddress)
    if (isSet(object?.msg?.validatorSrcAddress))
      obj.msg.validatorSrcAddress = String(object?.msg?.validatorSrcAddress)
    if (isSet(object?.msg?.validatorDstAddress))
      obj.msg.validatorDstAddress = String(object?.msg?.validatorDstAddress)
    if (isSet(object?.msg?.amount))
      obj.msg.amount = Coin.fromJSON(object?.msg?.amount)
    return obj
  },
  toJSON(message: MsgBabylonRedelegate): unknown {
    const obj: any = {}
    message.msg.delegatorAddress !== undefined &&
      (obj.msg.delegatorAddress = message.msg.delegatorAddress)
    message.msg.validatorSrcAddress !== undefined &&
      (obj.msg.validatorSrcAddress = message.msg.validatorSrcAddress)
    message.msg.validatorDstAddress !== undefined &&
      (obj.msg.validatorDstAddress = message.msg.validatorDstAddress)
    message.msg.amount !== undefined &&
      (obj.msg.amount = message.msg.amount
        ? Coin.toJSON(message.msg.amount)
        : undefined)
    return obj
  },
  fromPartial<I extends Exact<DeepPartial<MsgBabylonRedelegate>, I>>(
    object: I,
  ): MsgBabylonRedelegate {
    const message = createBaseMsgBeginRedelegate()
    message.msg.delegatorAddress = object?.msg?.delegatorAddress ?? ''
    message.msg.validatorSrcAddress = object?.msg?.validatorSrcAddress ?? ''
    message.msg.validatorDstAddress = object?.msg?.validatorDstAddress ?? ''
    if (object?.msg?.amount !== undefined && object?.msg?.amount !== null) {
      message.msg.amount = Coin.fromPartial(object?.msg?.amount)
    }
    return message
  },
}

// Undelegate protobuf type
export interface MsgBabylonUndelegate {
  msg: MsgUndelegate
}

function createBaseMsgUndelegate(): MsgBabylonUndelegate {
  return {
    msg: {
      delegatorAddress: '',
      validatorAddress: '',
      amount: Coin.fromPartial({}),
    },
  }
}
export const MsgBabylonUndelegate = {
  typeUrl: BABYLON_WRAPPED_MSG.undelegate,
  encode(
    message: MsgBabylonUndelegate,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.msg !== undefined) {
      MsgUndelegate.encode(message.msg, writer.uint32(10).fork()).ldelim()
    }
    return writer
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): MsgBabylonUndelegate {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input)
    const end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseMsgUndelegate()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break
          }

          message.msg = MsgUndelegate.decode(reader, reader.uint32())
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skip(tag & 7)
    }
    return message
  },
  fromJSON(object: any): MsgBabylonUndelegate {
    const obj = createBaseMsgUndelegate()
    if (isSet(object?.msg?.delegatorAddress))
      obj.msg.delegatorAddress = String(object?.msg?.delegatorAddress)
    if (isSet(object?.msg?.validatorAddress))
      obj.msg.validatorAddress = String(object?.msg?.validatorAddress)
    if (isSet(object?.msg?.amount))
      obj.msg.amount = Coin.fromJSON(object?.msg?.amount)
    return obj
  },
  toJSON(message: MsgBabylonUndelegate): unknown {
    const obj: any = {}
    message.msg.delegatorAddress !== undefined &&
      (obj.delegatorAddress = message.msg.delegatorAddress)
    message.msg.validatorAddress !== undefined &&
      (obj.validatorAddress = message.msg.validatorAddress)
    message.msg.amount !== undefined &&
      (obj.amount = message.msg.amount
        ? Coin.toJSON(message.msg.amount)
        : undefined)
    return obj
  },
  fromPartial<I extends Exact<DeepPartial<MsgBabylonUndelegate>, I>>(
    object: I,
  ): MsgBabylonUndelegate {
    const message = createBaseMsgUndelegate()
    message.msg.delegatorAddress = object?.msg?.delegatorAddress ?? ''
    message.msg.validatorAddress = object?.msg?.validatorAddress ?? ''
    if (object?.msg?.amount !== undefined && object?.msg?.amount !== null) {
      message.msg.amount = Coin.fromPartial(object?.msg?.amount)
    }
    return message
  },
}

// Delegate amino type
export interface MsgBabylonDelegateAmino {
  msg: {
    delegator_address?: string
    validator_address?: string
    amount: CoinAmino | undefined
  }
}

export const MsgBabylonDelegateAminoMsg = {
  [BABYLON_WRAPPED_MSG.delegate]: {
    aminoType: BABYLON_WRAPPED_MSG.delegate,
    toAmino: ({ msg }: MsgBabylonDelegate) => {
      return {
        msg: {
          delegator_address: msg?.delegatorAddress,
          validator_address: msg?.validatorAddress,
          amount: msg?.amount,
        },
      }
    },
    fromAmino: ({ msg }: MsgBabylonDelegateAmino) => ({
      msg: {
        delegatorAddress: msg?.delegator_address,
        validatorAddress: msg?.validator_address,
        amount: msg?.amount,
      },
    }),
  },
}

// Redelegate amino type
export interface MsgBabylonRedelegateAmino {
  msg: {
    delegator_address?: string
    validator_src_address?: string
    validator_dst_address?: string
    amount: CoinAmino | undefined
  }
}

export const MsgBabylonRedelegateAminoMsg = {
  [BABYLON_WRAPPED_MSG.beginRedelegate]: {
    aminoType: BABYLON_WRAPPED_MSG.beginRedelegate,
    toAmino: ({ msg }: MsgBabylonRedelegate) => {
      return {
        msg: {
          delegator_address: msg?.delegatorAddress,
          validator_src_address: msg?.validatorSrcAddress,
          validator_dst_address: msg?.validatorDstAddress,
          amount: msg?.amount,
        },
      }
    },
    fromAmino: ({ msg }: MsgBabylonRedelegateAmino) => ({
      msg: {
        delegatorAddress: msg?.delegator_address,
        validatorSrcAddress: msg?.validator_src_address,
        validatorDstAddress: msg?.validator_dst_address,
        amount: msg?.amount,
      },
    }),
  },
}

// Undelegate amino type
export interface MsgBabylonUndelegateAmino {
  msg: {
    delegator_address?: string
    validator_address?: string
    amount: CoinAmino | undefined
  }
}

export const MsgBabylonUndelegateAminoMsg = {
  [BABYLON_WRAPPED_MSG.undelegate]: {
    aminoType: BABYLON_WRAPPED_MSG.undelegate,
    toAmino: ({ msg }: MsgBabylonUndelegate) => {
      return {
        msg: {
          delegator_address: msg?.delegatorAddress,
          validator_address: msg?.validatorAddress,
          amount: msg?.amount,
        },
      }
    },
    fromAmino: ({ msg }: MsgBabylonUndelegateAmino) => ({
      msg: {
        delegatorAddress: msg?.delegator_address,
        validatorAddress: msg?.validator_address,
        amount: msg?.amount,
      },
    }),
  },
}

// Gov v1 message types
export interface MsgSubmitProposalAmino {
  messages?: Any[]
  initial_deposit: CoinAmino[]
  proposer?: string
  metadata?: string
  title?: string
  summary?: string
  expedited?: boolean
}

export const MsgSubmitProposalAminoMsg = {
  [BABYLON_WRAPPED_MSG.submitProposal]: {
    aminoType: 'cosmos-sdk/v1/MsgSubmitProposal',
    toAmino: ({
      messages,
      initialDeposit,
      proposer,
      metadata,
      title,
      summary,
      expedited,
    }: {
      messages: Any[]
      initialDeposit: Coin[]
      proposer: string
      metadata: string
      title: string
      summary: string
      expedited: boolean
    }) => ({
      messages: messages,
      initial_deposit: initialDeposit,
      proposer: proposer,
      metadata: metadata,
      title: title,
      summary: summary,
      expedited: expedited,
    }),
    fromAmino: ({
      messages,
      initial_deposit,
      proposer,
      metadata,
      title,
      summary,
      expedited,
    }: MsgSubmitProposalAmino) => ({
      messages: messages,
      initialDeposit: initial_deposit,
      proposer: proposer,
      metadata: metadata,
      title: title,
      summary: summary,
      expedited: expedited,
    }),
  },
}
