import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import '../App.css';
import firebase from "../../node_modules/firebase/compat/app";
import { signOut } from '../../node_modules/firebase/auth/';
import { auth, db } from '../firebase-config';
import TableHeadSort from '../components/TableHeadSort';

const GoldpassDashboard = () => {

    const [entityTransactions, setEntityTransactions] = useState([]);
    const [entityTransactionsCP, setEntityTransactionsCP] = useState([]);
    const [entityMembers, setEntityMembers] = useState([]);
    const [entities, setEntities] = useState([]);
    const [subscribers, setSubscribers] = useState([]);
    const [subscribersCP, setSubscribersCP] = useState([]);
    const [establishments, setEstablishments] = useState([]);
    const [issues, setIssues] = useState([]);
    const [passesSold, setPassesSold] = useState(0);
    const [numSubscribers, setNumSubscribers] = useState(0);
    const [numIssues, setNumIssues] = useState(0);
    const [sortColumnEnt, setSortColumnEnt] = useState("DATE");
    const [sortColumnSub, setSortColumnSub] = useState("DATE PURCHASED");
    const [sortAscEnt, setSortAscEnt] = useState(false);
    const [sortAscSub, setSortAscSub] = useState(false);
    const entityRefsSet = new Set();
    const establishmentRefsSet = new Set();
    let entityRefs;
    let pushUsers;
    let entityMap = {};

    const navigate = useNavigate();

    const isUserAdmin = async () => {
		const snapshot = await db.collection("Admins").get();
		if (snapshot.docs[0].data().IDs.includes(auth.currentUser.uid)) {
            return true;
		} else {
            return false;
		}
	}

    useEffect(() => {

        const checkAdminStatus = async () => {
            if (!auth.currentUser) {
                navigate("/sign-in");
                return;
            }
		
            const isAdmin = await isUserAdmin();
            if (!isAdmin) {
                navigate("/dashboard");
            }
            await getEntityMembers();
            await getEntityTransactions();
            await getSubscribers();
            await getReportedIssues();
            await getEntities();
            await getEstablishments();
        };

        checkAdminStatus();
	}, [navigate]);

    const getEntityTransactions = async () => {
		const snapshot = await db.collection("EntityTransactions")
        .orderBy("created_at", "desc")
        .get();
        const documents = snapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		}));

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.entity_ref) {
                entityRefsSet.add(data.entity_ref);
            }
        });

        setEntityTransactions(documents);
        setEntityTransactionsCP([...documents]);
        setPassesSold(snapshot.size);
	}

    const getEntityMembers = async () => {
		const snapshot = await db.collection("EntityMembers").get();
        const a = {};
		snapshot.forEach(doc => {
			a[doc.id] = doc.data().name;
		});
		setEntityMembers(a);
	}

    /*const getEntities = async () => {
        const snapshot = await db.collection("PushNotificationUsers").get();
        const a = {};
        snapshot.forEach(doc => {
            let name = "N/A";
            let ent = "N/A";
            if (doc.data().entity) {
                name = doc.data().entity.name ?  doc.data().entity.name : "N/A";
                ent = doc.data().entity.entity ? doc.data().entity.entity : "N/A";
            }
            a[doc.id] = [name,ent];
        });
        setEntities(a);
    }*/

    const getReportedIssues = async () => {
        const snapshot = await db.collection("ReportedIssue")
        .orderBy("created_at", "desc")
        .get();
        const documents = snapshot.docs.map(doc => {
            const data = doc.data();

            if (data.userRef) {
                entityRefsSet.add(data.userRef);
            }

            if (data.establishmentRef) {
                establishmentRefsSet.add(data.establishmentRef.id);
            }

            return {
                id: doc.id,
                ...data,
            };
        });

        entityRefs = Array.from(entityRefsSet);
        setIssues(documents);
        setNumIssues(snapshot.size);
    }

    const fetchEntitiesByIds = async (ids) => {
        if (!Array.isArray(ids) || ids.length === 0) {
            return [];
        }
        const chunks = [];
        const chunkSize = 10; // Keep it safe & fast

        for (let i = 0; i < ids.length; i += chunkSize) {
            chunks.push(ids.slice(i, i + chunkSize));
        }

        const allDocs = [];

        for (const chunk of chunks) {
            const qSnap = await db.collection("PushNotificationUsers")
                                .where(firebase.firestore.FieldPath.documentId(), 'in', chunk)
                                .get();
            qSnap.forEach(doc => {
                allDocs.push({ id: doc.id, ...doc.data() });
            });
        }

        return allDocs;
    };

    const fetchEstablishmentsByIds = async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return [];

    const chunks = [];
    const chunkSize = 10;

    for (let i = 0; i < ids.length; i += chunkSize) {
        chunks.push(ids.slice(i, i + chunkSize));
    }

    const allDocs = [];

    for (const chunk of chunks) {
        const qSnap = await db.collection("Establishments")
            .where(firebase.firestore.FieldPath.documentId(), "in", chunk)
            .get();
        qSnap.forEach(doc => {
            allDocs.push({ id: doc.id, ...doc.data() });
        });
    }

    return allDocs;
};

    const getEntities = async () => {
        pushUsers = await fetchEntitiesByIds(entityRefs);
        const entityMap = {};
        pushUsers.forEach(user => {
            entityMap[user.id] = user;
        });
        setEntities(entityMap);
    }

    const getEstablishments = async () => {
        const establishmentIds = Array.from(establishmentRefsSet);
        const est = await fetchEstablishmentsByIds(establishmentIds);
        const establishmentMap = {};
        est.forEach(e => {
            establishmentMap[e.id] = e;
        });
        setEstablishments(establishmentMap);
    }

    const getSubscribers = async () => {
        const snapshot = await db.collection("revenuecat_customer_subscriptions")
        .orderBy("purchase_date", "desc")
        .get();
        const documents = snapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		}));
        setSubscribers(documents);
        setSubscribersCP([...documents]);
        setNumSubscribers(snapshot.size);
    }

    const showEntitiesTable = () => {
		document.getElementsByClassName("table subscribers")[0].classList.add("hide");
		document.getElementsByClassName("table entities")[0].classList.remove("hide");
        document.getElementsByClassName("table issues")[0].classList.add("hide");
		document.getElementById("ent_tab").classList.add("active");
		document.getElementById("ent_tab").classList.remove("inactive");
		document.getElementById("sub_tab").classList.remove("active");
		document.getElementById("sub_tab").classList.add("inactive");
        document.getElementById("issues_tab").classList.add("inactive");
        document.getElementById("issues_tab").classList.remove("active");
        document.getElementById("SubscriberCount").classList.add("hide");
        document.getElementById("IssuesCount").classList.add("hide");
		document.getElementById("EntityCount").classList.remove("hide");
        document.getElementById("entity-search").classList.remove("hide");
        document.getElementById("subscriber-search").classList.add("hide");
	}

    const showSubscribersTable = () => {
		document.getElementsByClassName("table subscribers")[0].classList.remove("hide");
		document.getElementsByClassName("table entities")[0].classList.add("hide");
        document.getElementsByClassName("table issues")[0].classList.add("hide");
		document.getElementById("ent_tab").classList.remove("active");
		document.getElementById("ent_tab").classList.add("inactive");
		document.getElementById("sub_tab").classList.add("active");
		document.getElementById("sub_tab").classList.remove("inactive");
        document.getElementById("issues_tab").classList.add("inactive");
        document.getElementById("issues_tab").classList.remove("active");
        document.getElementById("SubscriberCount").classList.remove("hide");
		document.getElementById("EntityCount").classList.add("hide");
        document.getElementById("IssuesCount").classList.add("hide");
        document.getElementById("entity-search").classList.add("hide");
        document.getElementById("subscriber-search").classList.remove("hide");
	}

    const showIssuesTable = () => {
		document.getElementsByClassName("table subscribers")[0].classList.add("hide");
		document.getElementsByClassName("table entities")[0].classList.add("hide");
        document.getElementsByClassName("table issues")[0].classList.remove("hide");
		document.getElementById("ent_tab").classList.remove("active");
		document.getElementById("ent_tab").classList.add("inactive");
		document.getElementById("sub_tab").classList.remove("active");
		document.getElementById("sub_tab").classList.add("inactive");
        document.getElementById("issues_tab").classList.remove("inactive");
        document.getElementById("issues_tab").classList.add("active");
        document.getElementById("SubscriberCount").classList.add("hide");
		document.getElementById("EntityCount").classList.add("hide");
        document.getElementById("IssuesCount").classList.remove("hide");
        document.getElementById("entity-search").classList.add("hide");
        document.getElementById("subscriber-search").classList.add("hide");
	}

    function formatPhoneNumber(raw) {
        // 1) Strip to just digits
        const digits = (raw || '').replace(/\D/g, '');
      
        // 2) Match country code (1–3 digits) and 10‑digit national number
        const match = digits.match(/^(\d{1,3})(\d{3})(\d{3})(\d{4})$/);
        if (!match) {
          // couldn’t parse → return original
          return raw;
        }
      
        const [, country, area, prefix, line] = match;
        // 3) Build formatted string
        return `${country} (${area}) ${prefix}-${line}`;
    }

    function entitySearch(val) {
		if (val !== '') {
			const filteredEntities = entityTransactionsCP.filter(entity => {
                const memberId = entity.member_ref?.id;
                const memberName = entityMembers[memberId] || '';

                const entityId = entity.entity_ref?.id;
                const entityName = entities[entityId]?.entity?.name || '';

                const searchVal = val.toLowerCase();

                return ( 
                    memberName.toLowerCase().includes(searchVal) ||
                    entityName.toLowerCase().includes(searchVal)
                );
            });

			setEntityTransactions(filteredEntities);
            setPassesSold(filteredEntities.length);
		} else {
			setEntityTransactions([...entityTransactionsCP]);
			setPassesSold([...entityTransactionsCP].length);
		}
	}

    function subscriberSearch(val) {
		if (val !== '') {
			const filteredSubscribers = subscribersCP.filter(sub => {
                return sub.customer_name.toLowerCase().includes(val.toLowerCase());
            });

			setSubscribers(filteredSubscribers);
            setNumSubscribers(filteredSubscribers.length);
		} else {
            setSubscribers([...subscribersCP]);
            setNumSubscribers([...subscribersCP].length);
		}
	}

    function createCSV() {
        let csvContent = '"ENTITY NAME","ENTITY TYPE","MEMBER NAME","DATE SOLD","AMOUNT"\n';

        entityTransactions.forEach(et => {
            const entity = entities[et.entity_ref?.id];
            const jsDate = et.created_at.toDate?.() ?? new Date();
            const dateStr = jsDate.toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
        });

        // Safely get all values and escape quotes
        const values = [
            entity?.entity?.name || "N/A",
            entity?.entity?.entity || "N/A",
            et.member_ref?.id && entityMembers[et.member_ref.id] ? entityMembers[et.member_ref.id] : "N/A",
            dateStr,
            `$${et.amount}`
        ];

        const quotedRow = values.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");

            csvContent += quotedRow + "\n";
        });
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;

        downloadCSVFile(csvContent, `Entities_${timestamp}.csv`);
    }

    function createCSVSub() {
        let csvContent = '"DATE PURCHASED", "NAME", "PHONE", "EMAIL", "STATUS"\n';

        subscribers.map(sub => {
            const jsDate = sub.purchase_date.toDate?.() ?? new Date();
            const dateStr = jsDate.toLocaleString(undefined, {
                year:   'numeric',
                month:  'short',
                day:    '2-digit',
                hour:   '2-digit',
                minute: '2-digit',
                hour12: true,
            });

            const values = [
                dateStr,
                sub.customer_name || "N/A",
                formatPhoneNumber(sub.customer_phone),
                sub.customer_email,
                sub.status
            ]

            const quotedRow = values.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");
            csvContent += quotedRow + "\n";
        });
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;

        downloadCSVFile(csvContent, `Subscribers_${timestamp}.csv`);
    }

    function downloadCSVFile(csv_data, csv_name) {
 
		// Create CSV file object and feed
		// our csv_data into it
		let CSVFile = new Blob([csv_data], {
			type: "text/csv"
		});

		// Create to temporary link to initiate
		// download process
		var temp_link = document.createElement('a');

		// Download csv file
		temp_link.download = csv_name;
		var url = window.URL.createObjectURL(CSVFile);
		temp_link.href = url;

		// This link should not be displayed
		temp_link.style.display = "none";
		document.body.appendChild(temp_link);

		// Automatically click the link to
		// trigger download
		temp_link.click();
		document.body.removeChild(temp_link);
	}

    return (
        <div>
            <div className="topbar space">
                <NavLink to="/">
                    <img src='https://firebasestorage.googleapis.com/v0/b/localperkstest.appspot.com/o/perkspass.png?alt=media&token=899760db-0c70-4284-9425-f45543329990&_gl=1*1gkdcls*_ga*MTkxMzE3MzM5Mi4xNjg5MTE2MzM4*_ga_CW55HF8NVT*MTY5NjI4MDc4Ni44Ni4xLjE2OTYyODA4MDAuNDYuMC4w' to="/" alt="PerksPass Logo"></img>
                </NavLink>
                <div className='row'>
					<NavLink to="/dashboard">
						<p className='link'>Dashboard</p>
					</NavLink>
				</div>
            </div>
            <div className="col center" id="rel">
                <h1 id="title">
                    Goldpass Dashboard
                </h1>
                <div id="tabs" className='row'>
					<h2 className='active' id="ent_tab" onClick={() => showEntitiesTable()}>Entities</h2>
					<h2 className='ml24 inactive' id="sub_tab" onClick={() => showSubscribersTable()}>Subscribers</h2>
                    <h2 className='ml24 inactive' id="issues_tab" onClick={() => showIssuesTable()}>Issues</h2>
				</div>
                <div id="search" className='search row'>
					<input type='text' id="entity-search" placeholder='Search by Name' onChange={(e) => entitySearch(e.target.value)}></input>
                    <input type='text' id="subscriber-search" className="hide" placeholder='Search by Sub Name' onChange={(e) => subscriberSearch(e.target.value)}></input>
				</div>
                <h2 className='hide' id="SubscriberCount">Subscribers: {numSubscribers}</h2>
				<h2 id="EntityCount">Passes Sold: {passesSold}</h2>
                <h2 className='hide' id="IssuesCount">Reported Issues: {numIssues}</h2>
            </div>
            <div className='table entities'>
				<table id="entititiesTable">
					<thead>
						<tr>
                            <th>ENTITY NAME</th>
                            <th>ENTITY TYPE</th>
							<th>MEMBER NAME</th>
                            <TableHeadSort 
                                name="DATE"
                                sortColumn={sortColumnEnt}
                                sortAsc={sortAscEnt}
                                setSortAsc={setSortAscEnt}
                                array={entityTransactions}
                                setArray={setEntityTransactions}
                                setSortColumn={setSortColumnEnt}
                                className="fa-sort-down"
                                sortName="created_at"
                            />
                            <TableHeadSort
                                name="AMOUNT"
                                sortColumn={sortColumnEnt}
                                sortAsc={sortAscEnt}
                                setSortAsc={setSortAscEnt}
                                array={entityTransactions}
                                setArray={setEntityTransactions}
                                setSortColumn={setSortColumnEnt}
                                className="fa-sort"
                                sortName="amount"
                            />
                            <th className='sticky-header'>
                                <i id="download-goldpass" className="fas fa-download" onClick={() => createCSV()}></i>
                            </th>
						</tr>
					</thead>
					<tbody>
                        {entityTransactions.map(et => {
                            const entity = entities[et.entity_ref?.id];
                            const jsDate = et.created_at.toDate?.() ?? new Date();
                            const dateStr = jsDate.toLocaleString(undefined, {
                                year:   'numeric',
                                month:  'short',
                                day:    '2-digit',
                                hour:   '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            });
                            return (
							<tr key={et.id}>
                                <td>{entity?.entity?.name || "N/A"}</td>
                                <td>{entity?.entity?.entity || "N/A"}</td>
                                <td>{et.member_ref?.id && entityMembers[et.member_ref.id] ? entityMembers[et.member_ref.id] : "N/A"}</td>
								<td>{dateStr}</td>
								<td>{"$" + et.amount}</td>
                                <td></td>
							</tr>
						)})}
					</tbody>
				</table>
			</div>
            <div className='table subscribers hide'>
				<table id="subscribersTable">
					<thead>
						<tr>
							<TableHeadSort 
                                name="DATE PURCHASED"
                                sortColumn={sortColumnSub}
                                sortAsc={sortAscSub}
                                setSortAsc={setSortAscSub}
                                array={subscribers}
                                setArray={setSubscribers}
                                setSortColumn={setSortColumnSub}
                                className="fa-sort-down"
                                sortName="purchase_date"
                            />
							<th>NAME</th>
							<th>PHONE</th>
                            <th>EMAIL</th>
                            <th>STATUS</th>
                            <th className='sticky-header'>
                                <i className="fas fa-download" onClick={() => createCSVSub()}></i>
                            </th>
						</tr>
					</thead>
					<tbody>
                        {subscribers.map(sub => {
                            const jsDate = sub.purchase_date.toDate?.() ?? new Date();
                            const dateStr = jsDate.toLocaleString(undefined, {
                                year:   'numeric',
                                month:  'short',
                                day:    '2-digit',
                                hour:   '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            });
                        return(
                            <tr>
                                <td>{dateStr}</td>
                                <td>{sub.customer_name}</td>
                                <td>{formatPhoneNumber(sub.customer_phone)}</td>
                                <td>{sub.customer_email}</td>
                                <td>{sub.status}</td>
                                <td></td>
                            </tr>
                        )})}
					</tbody>
				</table>
			</div>
             <div className='table issues hide'>
				<table id="issuesTable">
					<thead>
						<tr>
                            <th>DATE</th>
							<th>NAME</th>
                            <th>EMAIL</th>
                            <th>VENDOR</th>
                            <th>MESSAGE</th>
						</tr>
					</thead>
					<tbody>
                        {issues.map(issue => {
                            const entity = entities[issue.userRef?.id];
                            const establishment = establishments[issue.establishmentRef?.id];
                            const jsDate = issue.created_at.toDate?.() ?? new Date();
                            const dateStr = jsDate.toLocaleString(undefined, {
                                year:   'numeric',
                                month:  'short',
                                day:    '2-digit',
                                hour:   '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            });
                            return (
                                <tr key={issue.id}>
                                    <td>{dateStr}</td>
                                    <td>{entity?.display_name || "N/A"}</td>
                                    <td>{issue.email}</td>
                                    <td>{establishment?.Name || "N/A"}</td>
                                    <td>{issue.message}</td>
                                </tr>
                            )
                        })}
					</tbody>
				</table>
			</div>
        </div>
    );
};

export default GoldpassDashboard;