const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const validator = require('validator')

const ProblemSchema = new Schema({
    item_name: {
        type: String,
        required: true
    },
    replaced: {
        type: Number,
        default: 0
    }, 
    will_ship: {
        type: Number,
        default: 0
    }
})

const TownSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    num_machines: {
        type: Number,
        required: true
    }, 
    contacts: {
        type: String,
        trim: true,
        default: undefined
    },
    address: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    parking_notes: {
        type: String,
        trim: true,
        default: undefined
    },
    building_notes: {
        type: String,
        trim: true,
        default: undefined
    },
    scheduled_time: {
        type: Date,
        default: undefined
    },
    time_string: {
        type: String,
        trim: true,
        default: undefined
    },
    phone_numbers: {
        type: String,
        trim: true,
        default: undefined
    },
    num_serviced: {
        type: Number,
        default: 0
    }, 
    problems: {
        type: [ProblemSchema],
        default: []
    },
    tech_notes: {
        type: String,
        trim: true,
        default: undefined
    },
    assigned_team: {
        type: String,
        trim: true,
        default: undefined
    },
    ship_status: {
        type: String,
        default: undefined
    },
    ship_date: {
        type: String,
        default: undefined
    },
    ship_tech: {
        type: String,
        trim: true,
        default: undefined
    },
    ship_notes: {
        type: String,
        trim: true,
        default: undefined
    }
})

const Town = mongoose.model('Town', TownSchema)
module.exports = Town