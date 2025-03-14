import Deal from "./Deal.js";

const GoldpassForm = (props) => {
    
    const goldpass = (event) => {
		if (document.getElementById("goldpass").value == "PerksPass") {
			document.getElementById("goldpass_deals").classList.add("hidden");
		} else {
			document.getElementById("goldpass_deals").classList.remove("hidden");
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
                    <Deal />
                    {/*<p className="label">Deal 1 Name</p>
                    <input type="text" placeholder="Deal 1 Name" name="deal_1_name" value={contact.deal_1_name} onChange={handleChange}></input>
                    <p className="label">Deal 1 Description</p>
                    <input type="text" placeholder="Deal 1 Description" name="deal_1_desc" value={contact.deal_1_desc} onChange={handleChange}></input>
                    <p className="label">Deal 1 Value</p>
                    <input type="number" placeholder="Deal 1 Value" name="deal_1_value" value={contact.deal_1_value} onChange={handleChange} step="0.01" min="0"></input>
                    <p className="label">Deal 2 Name</p>
                    <input type="text" placeholder="Deal 2 Name" name="deal_2_name" value={contact.deal_2_name} onChange={handleChange}></input>
                    <p className="label">Deal 2 Description</p>
                    <input type="text" placeholder="Deal 2 Description" name="deal_2_desc" value={contact.deal_2_desc} onChange={handleChange}></input>
                    <p className="label">Deal 2 Value</p>
                    <input type="number" placeholder="Deal 2 Value" name="deal_2_value" value={contact.deal_2_value} onChange={handleChange} step="0.01" min="0"></input>
                    <p className="label">Deal 3 Name</p>
                    <input type="text" placeholder="Deal 3 Name" name="deal_3_name" value={contact.deal_3_name} onChange={handleChange}></input>
                    <p className="label">Deal 3 Description</p>
                    <input type="text" placeholder="Deal 3 Description" name="deal_3_desc" value={contact.deal_3_desc} onChange={handleChange}></input>
                    <p className="label">Deal 3 Value</p>
                    <input type="number" placeholder="Deal 3 Value" name="deal_3_value" value={contact.deal_3_value} onChange={handleChange} step="0.01" min="0"></input>
                    <p className="label">Deal 4 Name</p>
                    <input type="text" placeholder="Deal 4 Name" name="deal_4_name" value={contact.deal_4_name} onChange={handleChange}></input>
                    <p className="label">Deal 4 Description</p>
                    <input type="text" placeholder="Deal 4 Description" name="deal_4_desc" value={contact.deal_4_desc} onChange={handleChange}></input>
                    <p className="label">Deal 4 Value</p>
                    <input type="number" placeholder="Deal 4 Value" name="deal_4_value" value={contact.deal_4_value} onChange={handleChange} step="0.01" min="0"></input>*/}
                </div>
            </div>
        </div>
    )
};

export default GoldpassForm;