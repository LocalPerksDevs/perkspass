//import { db } from "../firebaseConfig";
//import { doc, getDoc, updateDoc } from "firebase/firestore";

const sumID = "KX2KzdXXujVlGPcXET8V";

class GoldpassSum {

    constructor(db) {
        this.db = db;
    }

    async getSum() {
        try {
            const snapshot = await this.db.collection('GoldpassSum').doc(sumID).get();

            if (snapshot.exists) {
                console.log("Sum: ", snapshot.data().Sum);
                return snapshot.data().Sum;
            } else {
                console.error("Error: Document not found");
                return null;
            }
        } catch (error) {
            console.error("Error fetching sum:", error);
            return null;
        }
    }
}

export default GoldpassSum;