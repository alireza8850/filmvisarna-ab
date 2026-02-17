import type { SortOption } from "../utils/productPageHelpers";
import { useLoaderData } from "react-router-dom";
import { Row, Col, Form } from "react-bootstrap";
import { useStateContext } from "../utils/useStateObject";
import Select from "../parts/Select";
import FilmCard from "../Component/FilmCard";
import productsLoader from "../utils/productsLoader";
import { getHelpers } from "../utils/productPageHelpers";

export default function FilmPage() {
  const { products } = useLoaderData() as { products: unknown; };

  let { products: films, categories, sortOptions, sortDescriptions } =
    getHelpers(products as any);

  const [{ categoryChoice, sortChoice, bwImages }, setState] = useStateContext();

  const category = categoryChoice.split(" (")[0];

  const { key: sortKey, order: sortOrder } = sortOptions.find(
    (x) => x.description === sortChoice
  ) as SortOption;

  return (
    <>
      <Row>
        <Col>
          <h2 className="text-primary">Filmer</h2>
          <p>Här kan du se våra filmer och boka biljetter.</p>
        </Col>
      </Row>

      <Row>
        <Col className="px-4 pt-1 pb-4">
          <Row className="bg-primary-subtle pt-3 rounded">
            <Col md="4">
              <label className="d-block">
                <div className="d-none d-md-block">Color images:</div>
                <div
                  className={
                    "form-switch-text position-absolute" +
                    " d-md-none px-5" +
                    (bwImages ? "" : " text-white")
                  }
                >
                  B/W Images
                  <span className="float-end">Color Images</span>
                </div>

                <Form.Switch
                  className="mt-2 mb-4 mb-md-2"
                  defaultChecked={!bwImages}
                  onChange={(e) => setState("bwImages", !e.target.checked)}
                />
              </label>
            </Col>

            <Col md="4">
              <Select
                label="Category"
                value={categoryChoice}
                changeHandler={(x: string) => setState("categoryChoice", x)}
                options={categories}
              />
            </Col>

            <Col md="4">
              <Select
                label="Sort by"
                value={sortChoice}
                changeHandler={(x: string) => setState("sortChoice", x)}
                options={sortDescriptions}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      <Row className="mt-1 mb-n3">
        {films
          .filter((x: any) => category === "All" || x.categories.includes(category))
          .sort((a: any, b: any) => (a[sortKey] > b[sortKey] ? 1 : -1) * sortOrder)
          .map((film: any) => (
            <Col xs={12} lg={6} key={film.id}>
              <FilmCard {...film} />
            </Col>
          ))}
      </Row>
    </>
  );
}

// ✅ Put route AFTER the component
FilmPage.route = {
  path: "/",
  menuLabel: "Products",
  index: 1,
  parent: "/",
  loader: productsLoader,
};