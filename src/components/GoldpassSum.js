//import { db } from "../firebaseConfig";
//import { doc, getDoc, updateDoc } from "firebase/firestore";

const sumID = "KX2KzdXXujVlGPcXET8V";
let sum = 0;

class GoldpassSum {

    constructor(db) {
        this.db = db;
    }

    async getSum() {
        try {
            const snapshot = await this.db.collection('GoldpassSum').doc(sumID).get();

            if (snapshot.exists) {
                sum = snapshot.data().Sum;
                console.log("Sum: ", sum);
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

    async updateSum() {
        try {
            const snapshot = await this.db.collection('EstablishmentDeals').get();

            let newSum = 0;
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.Amount && data.Enabled) {
                    newSum += data.Amount;
                }
            });

            newSum = Math.round(newSum * 100) / 100;
            const sumSnapshot = await this.db.collection("GoldpassSum").doc(sumID);
            sumSnapshot.update({Sum: newSum});
        } catch (error) {
            console.error('Error updating sum: ', error);
        }
    }

    async calcNewSum(oldAmount, newAmount) {
        await this.getSum();
        let change = newAmount - oldAmount;
        let newSum = sum + change;
        await this.updateSum(newSum);
        //console.log("Sum is now: " + sum);
    }
}

export default GoldpassSum;