export default async function hallLoader() {
  const halls = await (await fetch("/api/halls")).json();
  return { halls };
}