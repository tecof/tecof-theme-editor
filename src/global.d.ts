// Vendor module declarations
declare module '*.min' {
  const content: any;
  export default content;
  export function create(options?: Record<string, any>): any;
}
