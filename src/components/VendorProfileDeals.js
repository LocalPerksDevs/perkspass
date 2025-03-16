import UpdateDeal from "./UpdateDeal.js";

const VendorProfileDeals = (props) => {
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
        </>
    )
}

export default VendorProfileDeals;