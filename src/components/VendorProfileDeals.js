import { NavLink, useNavigate } from "react-router-dom";
import UpdateDeal from "./UpdateDeal.js";

const VendorProfileDeals = (props) => {
    const navigate = useNavigate();

    return (
        <>
            <div className="col">
                <div className="row m24">
                    <div className="col">
                        <p className="label gold-pass-deals">GOLD PASS DEALS</p>
                    </div>
                </div>
            </div>
            {props.con.deals.map((deal, index) => (
                <UpdateDeal
                    key={index}
                    deal={deal}
                    index={index}
                    handleChange={props.hc}
                />
            ))}
            <div className="col">
                <div className="row m24">
                    <div className="col">
                        <button className="button vp-button" id="addDealBtn" onClick={() => navigate(`/add-deal/${props.vendorID}`)}>Add A New Deal</button>
                    </div>
                    <div className="col">
                    </div>
                </div>
            </div>
        </>
    )
}

export default VendorProfileDeals;