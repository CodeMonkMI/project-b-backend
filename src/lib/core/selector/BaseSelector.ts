import { IBaseSelector } from "./IBaseSelector";
export abstract class BaseSelector<TDelegate>
  implements IBaseSelector<TDelegate>
{
  base: { [key in keyof TDelegate]: boolean } = this.initializeWithTrue();
  find: { [key in keyof TDelegate]: boolean } = this.base;
  findOne: { [key in keyof TDelegate]: boolean } = this.base;
  findById: { [key in keyof TDelegate]: boolean } = this.base;
  create: { [key in keyof TDelegate]: boolean } = this.base;
  update: { [key in keyof TDelegate]: boolean } = this.base;
  delete: { [key in keyof TDelegate]: boolean } = this.base;

  private initializeWithTrue(): { [key in keyof TDelegate]: boolean } {
    const result = {} as { [key in keyof TDelegate]: boolean };
    const keys = Object.keys(this.getDelegatePrototype() as any) as Array<
      keyof TDelegate
    >;

    for (const key of keys) {
      result[key] = true;
    }
    result["id"] = true;
    console.log(result);
    return result;
  }

  private getDelegatePrototype(): TDelegate {
    return {} as TDelegate;
  }
}
