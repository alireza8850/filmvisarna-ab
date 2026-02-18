export default async function filmsLoader({ params }: any) {
  const id = params.id;
  const film = await (await fetch("/api/films/" + id)).json();
  return {
    film,
  };
}
