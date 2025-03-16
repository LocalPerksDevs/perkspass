const UpdateDeal = (props) => {
    return (
        <>
            <div className="col">
                <div className="row m24">
                    <div className="col">
                        <p className="label">DEAL {props.index + 1} NAME</p>
                        <input name="deal_name" className="vendor-input" value={props.deal.deal_name} onChange={(event) => props.handleChange(event, props.index)}></input>
                    </div>
                    <div className="col">
                        <p className="label">DEAL {props.index + 1} DESCRIPTION</p>
                        <input name="deal_desc" className="vendor-input" value={props.deal.deal_desc} onChange={(event) => props.handleChange(event, props.index)}></input>
                    </div>
                </div>
            </div>
            <div className="col">
                <div className="row m24">
                    <div className="col">
                        <p className="label">DEAL {props.index + 1} VALUE</p>
                        <input input type="number" name="deal_value" className="vendor-input" value={props.deal.deal_value} onChange={(event) => props.handleChange(event, props.index)} step="0.01" min="0"></input>
                    </div>
                    <div className="col">
                    <p className="label">DEAL {props.index + 1} Enabled?</p>
                        <p className="vendor-select">{props.deal.deal_enabled ? "Yes" : "No"}</p>
                        <select name="deal_enabled" id="deal_enabled" className="vendor-input vs hide" value={props.deal.deal_enabled ? "true" : "false"} onChange={(event) => props.handleChange(event, props.index)}>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UpdateDeal;