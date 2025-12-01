/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.iha_telemetry = (function() {

    /**
     * Namespace iha_telemetry.
     * @exports iha_telemetry
     * @namespace
     */
    var iha_telemetry = {};

    iha_telemetry.FlightData = (function() {

        /**
         * Properties of a FlightData.
         * @memberof iha_telemetry
         * @interface IFlightData
         * @property {number|null} [latitude] FlightData latitude
         * @property {number|null} [longitude] FlightData longitude
         * @property {number|null} [altitude] FlightData altitude
         * @property {number|null} [speed] FlightData speed
         * @property {number|null} [heading] FlightData heading
         * @property {number|null} [battery] FlightData battery
         * @property {number|Long|null} [timestamp] FlightData timestamp
         */

        /**
         * Constructs a new FlightData.
         * @memberof iha_telemetry
         * @classdesc Represents a FlightData.
         * @implements IFlightData
         * @constructor
         * @param {iha_telemetry.IFlightData=} [properties] Properties to set
         */
        function FlightData(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * FlightData latitude.
         * @member {number} latitude
         * @memberof iha_telemetry.FlightData
         * @instance
         */
        FlightData.prototype.latitude = 0;

        /**
         * FlightData longitude.
         * @member {number} longitude
         * @memberof iha_telemetry.FlightData
         * @instance
         */
        FlightData.prototype.longitude = 0;

        /**
         * FlightData altitude.
         * @member {number} altitude
         * @memberof iha_telemetry.FlightData
         * @instance
         */
        FlightData.prototype.altitude = 0;

        /**
         * FlightData speed.
         * @member {number} speed
         * @memberof iha_telemetry.FlightData
         * @instance
         */
        FlightData.prototype.speed = 0;

        /**
         * FlightData heading.
         * @member {number} heading
         * @memberof iha_telemetry.FlightData
         * @instance
         */
        FlightData.prototype.heading = 0;

        /**
         * FlightData battery.
         * @member {number} battery
         * @memberof iha_telemetry.FlightData
         * @instance
         */
        FlightData.prototype.battery = 0;

        /**
         * FlightData timestamp.
         * @member {number|Long} timestamp
         * @memberof iha_telemetry.FlightData
         * @instance
         */
        FlightData.prototype.timestamp = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new FlightData instance using the specified properties.
         * @function create
         * @memberof iha_telemetry.FlightData
         * @static
         * @param {iha_telemetry.IFlightData=} [properties] Properties to set
         * @returns {iha_telemetry.FlightData} FlightData instance
         */
        FlightData.create = function create(properties) {
            return new FlightData(properties);
        };

        /**
         * Encodes the specified FlightData message. Does not implicitly {@link iha_telemetry.FlightData.verify|verify} messages.
         * @function encode
         * @memberof iha_telemetry.FlightData
         * @static
         * @param {iha_telemetry.IFlightData} message FlightData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FlightData.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.latitude != null && Object.hasOwnProperty.call(message, "latitude"))
                writer.uint32(/* id 1, wireType 1 =*/9).double(message.latitude);
            if (message.longitude != null && Object.hasOwnProperty.call(message, "longitude"))
                writer.uint32(/* id 2, wireType 1 =*/17).double(message.longitude);
            if (message.altitude != null && Object.hasOwnProperty.call(message, "altitude"))
                writer.uint32(/* id 3, wireType 5 =*/29).float(message.altitude);
            if (message.speed != null && Object.hasOwnProperty.call(message, "speed"))
                writer.uint32(/* id 4, wireType 5 =*/37).float(message.speed);
            if (message.heading != null && Object.hasOwnProperty.call(message, "heading"))
                writer.uint32(/* id 5, wireType 5 =*/45).float(message.heading);
            if (message.battery != null && Object.hasOwnProperty.call(message, "battery"))
                writer.uint32(/* id 6, wireType 5 =*/53).float(message.battery);
            if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                writer.uint32(/* id 7, wireType 0 =*/56).int64(message.timestamp);
            return writer;
        };

        /**
         * Encodes the specified FlightData message, length delimited. Does not implicitly {@link iha_telemetry.FlightData.verify|verify} messages.
         * @function encodeDelimited
         * @memberof iha_telemetry.FlightData
         * @static
         * @param {iha_telemetry.IFlightData} message FlightData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FlightData.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a FlightData message from the specified reader or buffer.
         * @function decode
         * @memberof iha_telemetry.FlightData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {iha_telemetry.FlightData} FlightData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FlightData.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.iha_telemetry.FlightData();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.latitude = reader.double();
                        break;
                    }
                case 2: {
                        message.longitude = reader.double();
                        break;
                    }
                case 3: {
                        message.altitude = reader.float();
                        break;
                    }
                case 4: {
                        message.speed = reader.float();
                        break;
                    }
                case 5: {
                        message.heading = reader.float();
                        break;
                    }
                case 6: {
                        message.battery = reader.float();
                        break;
                    }
                case 7: {
                        message.timestamp = reader.int64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a FlightData message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof iha_telemetry.FlightData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {iha_telemetry.FlightData} FlightData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FlightData.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FlightData message.
         * @function verify
         * @memberof iha_telemetry.FlightData
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FlightData.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.latitude != null && message.hasOwnProperty("latitude"))
                if (typeof message.latitude !== "number")
                    return "latitude: number expected";
            if (message.longitude != null && message.hasOwnProperty("longitude"))
                if (typeof message.longitude !== "number")
                    return "longitude: number expected";
            if (message.altitude != null && message.hasOwnProperty("altitude"))
                if (typeof message.altitude !== "number")
                    return "altitude: number expected";
            if (message.speed != null && message.hasOwnProperty("speed"))
                if (typeof message.speed !== "number")
                    return "speed: number expected";
            if (message.heading != null && message.hasOwnProperty("heading"))
                if (typeof message.heading !== "number")
                    return "heading: number expected";
            if (message.battery != null && message.hasOwnProperty("battery"))
                if (typeof message.battery !== "number")
                    return "battery: number expected";
            if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                    return "timestamp: integer|Long expected";
            return null;
        };

        /**
         * Creates a FlightData message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof iha_telemetry.FlightData
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {iha_telemetry.FlightData} FlightData
         */
        FlightData.fromObject = function fromObject(object) {
            if (object instanceof $root.iha_telemetry.FlightData)
                return object;
            var message = new $root.iha_telemetry.FlightData();
            if (object.latitude != null)
                message.latitude = Number(object.latitude);
            if (object.longitude != null)
                message.longitude = Number(object.longitude);
            if (object.altitude != null)
                message.altitude = Number(object.altitude);
            if (object.speed != null)
                message.speed = Number(object.speed);
            if (object.heading != null)
                message.heading = Number(object.heading);
            if (object.battery != null)
                message.battery = Number(object.battery);
            if (object.timestamp != null)
                if ($util.Long)
                    (message.timestamp = $util.Long.fromValue(object.timestamp)).unsigned = false;
                else if (typeof object.timestamp === "string")
                    message.timestamp = parseInt(object.timestamp, 10);
                else if (typeof object.timestamp === "number")
                    message.timestamp = object.timestamp;
                else if (typeof object.timestamp === "object")
                    message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from a FlightData message. Also converts values to other types if specified.
         * @function toObject
         * @memberof iha_telemetry.FlightData
         * @static
         * @param {iha_telemetry.FlightData} message FlightData
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FlightData.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.latitude = 0;
                object.longitude = 0;
                object.altitude = 0;
                object.speed = 0;
                object.heading = 0;
                object.battery = 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.timestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.timestamp = options.longs === String ? "0" : 0;
            }
            if (message.latitude != null && message.hasOwnProperty("latitude"))
                object.latitude = options.json && !isFinite(message.latitude) ? String(message.latitude) : message.latitude;
            if (message.longitude != null && message.hasOwnProperty("longitude"))
                object.longitude = options.json && !isFinite(message.longitude) ? String(message.longitude) : message.longitude;
            if (message.altitude != null && message.hasOwnProperty("altitude"))
                object.altitude = options.json && !isFinite(message.altitude) ? String(message.altitude) : message.altitude;
            if (message.speed != null && message.hasOwnProperty("speed"))
                object.speed = options.json && !isFinite(message.speed) ? String(message.speed) : message.speed;
            if (message.heading != null && message.hasOwnProperty("heading"))
                object.heading = options.json && !isFinite(message.heading) ? String(message.heading) : message.heading;
            if (message.battery != null && message.hasOwnProperty("battery"))
                object.battery = options.json && !isFinite(message.battery) ? String(message.battery) : message.battery;
            if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                if (typeof message.timestamp === "number")
                    object.timestamp = options.longs === String ? String(message.timestamp) : message.timestamp;
                else
                    object.timestamp = options.longs === String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber() : message.timestamp;
            return object;
        };

        /**
         * Converts this FlightData to JSON.
         * @function toJSON
         * @memberof iha_telemetry.FlightData
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FlightData.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for FlightData
         * @function getTypeUrl
         * @memberof iha_telemetry.FlightData
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        FlightData.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/iha_telemetry.FlightData";
        };

        return FlightData;
    })();

    return iha_telemetry;
})();

module.exports = $root;
