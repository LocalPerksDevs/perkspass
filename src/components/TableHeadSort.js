import { useState, useEffect } from 'react';

const TableHeadSort = (props) => {
    // Wrapper to call correct sort method

    const [className, setClassName] = useState(props.className);

    useEffect(() => {
        if (props.name !== props.sortColumn) {
            setClassName("fa-sort");
        }
    }, [props.sortColumn, props.name]);

	function sort(name) {
		if (name === props.sortColumn) {
			if (props.sortAsc) {
				const sorted = props.array.slice().sort((a,b) => {
                    if(isTimestamp(a[props.sortName])) {
                        return sortDateDesc(a,b,props.sortName);
                    } else if (typeof a[props.sortName] === "number") {
                        return b[props.sortName] - a[props.sortName];
                    } else {
                        return b[props.sortName].localeCompare(a[props.sortName]);
                    }
				});
                props.setArray([...sorted]);
				changeSortIcon(name, true);
			} else {
				const sorted = props.array.slice().sort((a,b) => {
                    if(isTimestamp(a[props.sortName])) {
                        return sortDateAsc(a,b,props.sortName);
                    } else if (typeof a[props.sortName] === "number") {
                        return a[props.sortName] - b[props.sortName];
                    } else {
                        return a[props.sortName].localeCompare(b[props.sortName]);
                    }
					
				});
                props.setArray([...sorted]);
				changeSortIcon(name, false);
			}
		} else {
			resetSortStatus(props.sortColumn);
			props.setSortColumn(name);
			const sorted = props.array.slice().sort((a,b) => {
                if(isTimestamp(a[props.sortName])) {
                    return sortDateAsc(a,b,props.sortName);
                } else if (typeof a[props.sortName] === "number") {
                    return a[props.sortName] - b[props.sortName];
                } else {
                    return a[props.sortName].localeCompare(b[props.sortName]);
                }
			});
            props.setArray([...sorted]);
			changeSortIcon(name, false);
		}
	}

    function changeSortIcon(name, sortDesc) {
		document.getElementById(name).classList.remove("fa-sort");
		if (sortDesc) {
            setClassName("fa-sort-down");
			props.setSortAsc(false);
		} else {
            setClassName("fa-sort-up");
			props.setSortAsc(true);
		}
	}

	function resetSortStatus(name) {
        setClassName("fa-sort");
	}

    function sortDateAsc(a, b, name) {
	    const timeA = new Date(a[name]?.toDate?.() ?? a[name]).getTime();
	    const timeB = new Date(b[name]?.toDate?.() ?? b[name]).getTime();
	    return timeA - timeB;
    }

    function sortDateDesc(a, b, name) {
	    const timeA = new Date(a[name]?.toDate?.() ?? a[name]).getTime();
	    const timeB = new Date(b[name]?.toDate?.() ?? b[name]).getTime();
	    return timeB - timeA;
    }

    function isTimestamp(val) {
        return val instanceof Date ||
         typeof val?.toDate === "function" ||
         (typeof val === "string" && !isNaN(Date.parse(val)));
    };

    return (
        <th className='sort' onClick={() => { sort(props.name) }}>
            {props.name.toUpperCase() + "\u00A0"}
            <i id={props.name} className={"fa-solid " + className}></i>
        </th>
    )
}

export default TableHeadSort;