export interface IBaseSelector<TDelegate> {
  base: { [key in keyof TDelegate]: boolean };
  find: { [key in keyof TDelegate]: boolean };
  findOne: { [key in keyof TDelegate]: boolean };
  findById: { [key in keyof TDelegate]: boolean };
  create: { [key in keyof TDelegate]: boolean };
  update: { [key in keyof TDelegate]: boolean };
  delete: { [key in keyof TDelegate]: boolean };
}
