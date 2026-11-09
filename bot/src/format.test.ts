import { test } from "node:test";
import assert from "node:assert/strict";
import { beerTitle } from "./format.js";

test("beerTitle no repite la marca", () => {
  assert.equal(beerTitle({ brand: "Duvel", name: "Duvel" }), "Duvel");
  assert.equal(beerTitle({ brand: "Damm", name: "Damm Lemon" }), "Damm Lemon");
  assert.equal(beerTitle({ brand: "Estrella", name: "Estrellita" }), "Estrella Estrellita");
  assert.equal(beerTitle({ brand: "1906", name: "Reserva Especial" }), "1906 Reserva Especial");
  assert.equal(beerTitle({ brand: "", name: "Voll-Damm" }), "Voll-Damm");
});
