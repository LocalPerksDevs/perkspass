const Deal = (props) => {
    return (
        <div>
            <p className="label">Deal Name</p>
            <input type="text" placeholder="Deal Name" name="deal_name" value={props.name} onChange={props.handleChange}></input>
            <p className="label">Deal Description</p>
            <input type="text" placeholder="Deal Description" name="deal_desc" value={props.desc} onChange={props.handleChange}></input>
            <p className="label">Deal Value</p>
            <input type="number" placeholder="Deal Value" name="deal_value" value={props.value} onChange={props.handleChange} step="0.01" min="0"></input>
        </div>
    )
}

export default Deal;