// src/types/scss.d.ts
// Permite importar arquivos .scss (side-effect ou com valores) sem erro de tipo.
declare module '*.scss' {
  const content: { readonly [className: string]: string };
  export default content;
}
