export default async function filmsLoader({ params }: any) {
  const id = params.id;
  const film = await (await fetch("/api/films/" + id)).json();
  const showings = await (await fetch("/api/films/" + id + "/showings")).json();
  return {
    film,
    showings,
  };
}
