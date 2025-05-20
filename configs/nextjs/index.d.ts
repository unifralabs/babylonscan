import '@tanstack/react-table'

declare global {
  interface BigInt {
    toJSON(): string
  }
}

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    textAlign?: 'left' | 'center' | 'right'
    isMobileFullRow?: boolean
  }
}
