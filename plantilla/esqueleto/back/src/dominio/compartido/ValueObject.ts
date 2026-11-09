function congelarProfundo<U>(objeto: U): Readonly<U> {
  if (objeto && typeof objeto === "object") {
    Object.freeze(objeto);
    for (const clave of Object.keys(objeto)) {
      const valor = (objeto as Record<string, unknown>)[clave];
      if (valor && typeof valor === "object" && !Object.isFrozen(valor)) {
        congelarProfundo(valor);
      }
    }
  }
  return objeto;
}

export abstract class ValueObject<T extends object> {
  protected readonly props: Readonly<T>;

  protected constructor(props: T) {
    this.props = congelarProfundo({ ...props });
    Object.freeze(this);
  }

  public esIgual(otro?: ValueObject<T> | null): boolean {
    if (otro === null || otro === undefined) {
      return false;
    }
    if (otro.props === undefined) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(otro.props);
  }
}
