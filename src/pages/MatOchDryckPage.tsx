import { useState } from "react";
import { Row, Col } from "react-bootstrap";
import "/sass/_matochdryck.scss";


MatOchDryckPage.route = {
    path: "/mat-och-dryck",
};


const menuSections = [
    {
        id: "popcorn",
        title:"Popcorn",
        desc: "Bio är inte komplett utan nygjorda popcorn. Våra popcorn poppas dagligen för att ge den perfekta krispigheten och smaken som hör bioupplevelsen till. Välj mellan klassiskt saltade eller prova någon av våra smaksatta varianter för något extra.",
        image: "/images/popcorn.jpg",
        linkText: "Se menyn",
        items:[
            {name: "Popcorn liten", desc:"50 g original popcorn", price:"45 kr"},
            {name: "Popcorn mellan", desc:"100 g original popcorn", price:"75 kr"},
            {name: "Popcorn Stor", desc:"150 g original popcorn", price:"95 kr"},
            {name: "Chocklad popcorn", desc:"50 g popcorn med ckoklad smak", price:" 50 kr"},
            {name: "Ost popcorn", desc:"50 g popcorn med ost smak", price:"50 kr"},
        ],
        imageR: true,
    },
    {
        id: "Godis",
        title:"Godis",
        desc: "I vår godisbar hittar du något för alla smaker. Välj bland choklad, surt, sött och klassiska favoriter. Plocka själv dina favoriter och skapa den perfekta mixen till filmen.",
        image: "/images/godis.jpg",
        linkText: "Se menyn",
        items:[
            {name: "Godis liten", desc:"plocka 200 g godis", price:"39 kr"},
            {name: "Godis mellan", desc:"plocka 400 g godis", price:"55 kr"},
            {name: "Godis Stor", desc:"plocka 600 g godis", price:"69 kr"},
            {name: "Premium Godis", desc:"plocka mixad och blandat 600 g godis ", price:"75 kr"},
        ],
        imageR: false,
    },
    {
        id: "Bar",
        title:"Bar och bistro",
        desc: "Ta filmkvällen till nästa nivå i vår Bar & Bistro. Här kan du njuta av god mat, snacks och drycker i en avslappnad miljö före eller efter filmen. Vi serverar allt från enklare rätter och snacks till uppfriskande drycker som passar perfekt till en kväll på bio.",
        image: "/images/mat_och_dryck.jpg",
        linkText: "Se menyn",
        items:[
            {name: "Grillad macka", desc:"Kyckling/Kalkon/Bacon, tomat, romansallad, majonäs", price:"65 kr"},
            {name: "Caesar sallad", desc:"kyckling, krispig romansallad, knaperstekt bacon, hyvlad parmesanost och frasiga brödkrutonger", price:"89 kr"},
            {name: "Läsk", desc:"50cl Coca-cola/Fatnta/Sprite", price:"25 kr"},
            {name: "Öl", desc:"50cl fatöl", price:"65 kr"},
            {name: "Glass", desc:"100 ml glass av massa olika smaker", price:"50 kr"},
        ],
        imageR: true,
    },
];

export default function MatOchDryckPage(){
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const activeSection = menuSections.find((s) => s.id === openMenu);


    return (
    <article className="food-page">
        <div className="food-hero">
            <div className="food-hero-bg" />
            <div className="food-hero-overlay" />
            <div className="food-hero-content">
                <h1 className="food-hero-title">Mat &amp; Dryck</h1>
                <p>
                    Ett biobesök blir ännu bättre med något gott att äta eller dricka. 
                    I vår butik hittar du ett brett sortiment av snacks, godis och drycker.
                    Är du sugen på något mer finns även Nachos och varma rätter att välja på. 
                    Du kan dessutom beställa mat och dryck från vår Bar & Bistro och få det 
                    serverat direkt till din plats i salongen.
                </p>
            </div>
        </div>


        <div className={`container mt-5 ${openMenu ? "blurred" : ""}`}>
            {menuSections.map((section) => (
                <Row key={section.id} className="align-items-center food-section py-5">
                    <Col xs={12} md={6} className={section.imageR ? "order-1" : "order-md-2 order-1"}>
                        <h2 className="food-section-title">{section.title}</h2>
                        <p className="food-section-desc">{section.desc}</p>
                        <button className="food-link" onClick={() => setOpenMenu(section.id)}>
                            {section.linkText}
                        </button>
                    </Col>
                    <Col xs={12} md={6} className={section.imageR ? "order-2" : "order-md-1 order-2"}>
                        <div className="food-image-wrap">
                            <img src={section.image} alt={section.title} className="food-image" />
                        </div>
                    </Col>
                </Row>
            ))}
        </div>

        {openMenu && activeSection && (
            <div className="food-modal-backdrop" onClick={() => setOpenMenu(null)}>
                <div className="food-modal" onClick={(e) => e.stopPropagation()}>
                    <button className="food-modal-close" onClick={() => setOpenMenu(null)}>
                        <i className="bi bi-x" />
                    </button>
                    <h2 className="food-modal-title">{activeSection.title}</h2>
                    <p className="food-modal-sub">{activeSection.desc}</p>
                    <hr className="food-modal-divider" />
                    {activeSection.items.map((item, i) => (
                        <Row key={i} className="food-modal-item align-items-center py-3">
                            <Col>
                                <span className="food-modal-item-name">{item.name}</span>
                                <span className="food-modal-item-desc d-block">{item.desc}</span>
                            </Col>
                            <Col xs="auto">
                                <span className="food-modal-item-price">{item.price}</span>
                            </Col>
                        </Row>
                    ))}
                    <div className="food-modal-footer mt-4">
                        <i className="bi bi-info-circle me-2" />
                        Betalas i kassan. Vi tar emot kort och Swish.
                    </div>
                </div>
            </div>
        )}

    </article>
);
}