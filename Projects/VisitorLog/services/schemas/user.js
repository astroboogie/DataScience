// require mongoose or db that we use

module.exports = {
    studentId      : { type: ObjectId, index: true, required: true },
    userFirst      : { type: String, index: false, required: false },
    userLast       : { type: String, index: false, required: false },
    arrivalTime    : { type: Date, index: true, required: true },
    //possible exit time?
    activity: [{
        servicesUsed: String,
        // ie: 3d printer, 
        // -- could be array or sercivesOffered or object representation of service
        lastVisit:    Date,
        numberOfVisits: Number
    }],
    classes: [{
        // would need collection of classes offered at all institutions
        // another possible project to crawl the class schedule and parse it?
        
    }]
};