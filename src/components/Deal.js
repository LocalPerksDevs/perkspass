const Deal = (props) => {
    return (
        <div className={props.className}>
            <p className="label">Deal {props.index + 1} Name</p>
            <input type="text" placeholder={"Deal " + (props.index + 1) + " Name"} name="deal_name" value={props.deal.deal_name} onChange={(event) => props.handleChange(event, props.index)}></input>
            <p className="label">Deal {props.index + 1} Description</p>
            <input type="text" placeholder={"Deal " + (props.index + 1) + " Description"} name="deal_desc" value={props.deal.deal_desc} onChange={(event) => props.handleChange(event, props.index)}></input>
            <p className="label">Deal {props.index + 1} Value</p>
            <input type="number" name="deal_value" value={props.deal.deal_value} onChange={(event) => props.handleChange(event, props.index)} step="0.01" min="0"></input>
        </div>
    )
}

export default Deal;