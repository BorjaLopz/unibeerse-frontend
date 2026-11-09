// Exporta las cervezas y los comentarios de Firestore a migration/out/*.json.
// Ejecutar desde la raiz del repo (usa el SDK de Firebase que ya esta en node_modules):
//     node migration/export-firestore.mjs
// Usa la configuracion PUBLICA de la web (sin claves privadas). NO exporta la coleccion "users"
// (contiene contrasenas) ni los emails de los comentarios.
import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { mkdirSync, writeFileSync } from "node:fs";

const app = initializeApp({
  apiKey: "AIzaSyDe-vhUew0LF32bYnoXPa2xLsEvSfyOr4k",
  authDomain: "unibeerse-db.firebaseapp.com",
  projectId: "unibeerse-db",
  storageBucket: "unibeerse-db.appspot.com",
  messagingSenderId: "734269366757",
  appId: "1:734269366757:web:37ba5872bc66b31aa50f0c",
});
const db = getFirestore(app);

mkdirSync("migration/out", { recursive: true });

async function dump(name, pick) {
  const snap = await getDocs(collection(db, name));
  const rows = snap.docs.map((d) => pick(d.data()));
  writeFileSync(`migration/out/${name}.json`, JSON.stringify(rows, null, 1));
  console.log(`${name}: ${rows.length} documentos`);
}

try {
  await dump("beers", (d) => d);
  // Del comentario solo guardamos lo que va a la base nueva: nombre, texto y a que cerveza pertenece.
  await dump("comments", (d) => ({ name: d.name ?? "", comment: d.comment ?? "", beerID: d.beerID ?? null }));
  process.exit(0);
} catch (e) {
  console.error("No se pudo leer Firestore:", e.code ?? e.message);
  console.error("Si es 'permission-denied', las reglas no permiten lectura publica: avisame y usamos otra via.");
  process.exit(1);
}
