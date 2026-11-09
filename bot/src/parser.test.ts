import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseBeer } from "./parser.js";

describe("parseBeer", () => {
  it("entiende el formato completo con coma decimal", () => {
    assert.deepEqual(parseBeer("Estrella Galicia, Especial, Lager, 5,5, España"), {
      brand: "Estrella Galicia", name: "Especial", style: "Lager", abv: 5.5, country: "España", score: null, notes: "",
    });
  });

  it("el orden de graduacion y pais es libre y admite % y nota", () => {
    assert.deepEqual(parseBeer("1906, Reserva Especial · 6,5% · espana · nota 8"), {
      brand: "1906", name: "Reserva Especial", style: "", abv: 6.5, country: "España", score: 8, notes: "",
    });
  });

  it("una marca numerica (86, 1906) no se confunde con la graduacion", () => {
    const b = parseBeer("86, Intense Blonde Ale, Blonde Ale, 8,6, Holanda");
    assert.equal(b?.brand, "86");
    assert.equal(b?.abv, 8.6);
    assert.equal(b?.country, "Holanda");
    assert.equal(parseBeer("1906, Black Coupage")?.brand, "1906");
    assert.equal(parseBeer("1906, Black Coupage")?.abv, null);
  });

  it("un numero suelto tras la graduacion es la nota", () => {
    const b = parseBeer("Mahou, Cinco Estrellas, Lager, 5.5, España, 7");
    assert.equal(b?.abv, 5.5);
    assert.equal(b?.score, 7.5 - 0.5);
  });

  it("con un solo texto es el nombre; saltos de linea y punto y coma separan", () => {
    assert.equal(parseBeer("Voll-Damm")?.name, "Voll-Damm");
    assert.equal(parseBeer("Voll-Damm")?.brand, "");
    const b = parseBeer("Damm\nVoll-Damm\nDoble malta; 7,2");
    assert.deepEqual([b?.brand, b?.name, b?.style, b?.abv], ["Damm", "Voll-Damm", "Doble malta", 7.2]);
  });

  it("paises dobles y alias", () => {
    assert.equal(parseBeer("A, B, españa / francia")?.country, "España / Francia");
    assert.equal(parseBeer("A, B, EEUU")?.country, "Estados Unidos");
  });

  it("sin texto util devuelve null", () => {
    assert.equal(parseBeer(""), null);
    assert.equal(parseBeer("5,5"), null);
    assert.equal(parseBeer("España"), null);
  });
});
