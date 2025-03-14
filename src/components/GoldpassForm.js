import Deal from "./Deal.js";

const GoldpassForm = (props) => {
    
    const goldpass = (event) => {
		if (document.getElementById("goldpass").value == "PerksPass") {
			document.getElementById("goldpass_deals").classList.add("hidden");
            document.getElementById("addDealBtn").classList.add("hidden");
		} else {
			document.getElementById("goldpass_deals").classList.remove("hidden");
            document.getElementById("addDealBtn").classList.remove("hidden");
            if (props.con.deals.length === 0) {
                addDeal();
            }
		}
		
		props.hc(event);
	}

    const addDeal = () => {
        props.setC((prev) => ({
            ...prev,
            deals: [...prev.deals, { deal_name: "", deal_desc: "", deal_value: 0 }]
        }));
    };

    return (
        <div className="form" id="goldpass-form">
            <div className="col center">
                <label htmlFor="goldpass" className="mt24 label">For Perks Pass or Gold Pass?</label>
                <select name="goldpass" id="goldpass" value={props.con.goldpassVal} onChange={goldpass}>
                    <option value="PerksPass" id="PerksPass">PerksPass Only</option>
                    <option value="GoldPass" id="GoldPass">GoldPass Only</option>
                    <option value="Both" id="Both">Both</option>
                </select>
                <div id="goldpass_deals" className="hidden">
                    {props.con.deals.map((deal, index) => (
                        <Deal
                            key={index}
                            deal={deal}
                            index={index}
                            handleChange={props.hc}
                        />
                    ))}
                </div>
                <div className="button hidden" id="addDealBtn" onClick={addDeal}>Add Another Deal</div>
            </div>
        </div>
    )
};

export default GoldpassForm;