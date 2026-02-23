export default async function filmsLoader({ params }: any) {
  const id = params.id;
  const film = await (await fetch("/api/tickets/prices" + id)).json();
  return {
    film,
  };
}
