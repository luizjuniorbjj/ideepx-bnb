Trading API for The Edge Trading Platform (0.9)
To ensure proper connectivity when developing bots for the GMI Edge trading platform, it is essential to connect to the correct API and Event endpoints based on your account type, country/region, and server.

Each trading server has specific ports for API, and the appropriate endpoint must be used for successful communication with the platform.

Please refer to the table below to identify the correct endpoints for your use case:

Demo:

https://demo-edge-api.gmimarkets.com:7530/api/v1
wss://demo-edge-ws.gmimarkets.com:7420/api/v1
Standard/ECN:

https://live-edge-api.gmimarkets.com:7530/api/v1
wss://live-edge-ws.gmimarkets.com:7420/api/v1
Cent:

https://cent-edge-api.gmimarkets.com:6530/api/v1
wss://cent-edge-ws.gmimarkets.com:6420/api/v1
Time
Get current server time.
This endpoint returns the current server time in nanoseconds from an epoch (UTC).

Responses
200 Success
default Error response

get
/servertime

Response samples
200default
Content type
application/json

Copy
{
"NanosecondsFromEpoch": 0
}
Authorization
Authorization is required for all API requests, excluding /servertime, /login and /refresh. The authorization HTTP header is used for this purpose: Authorization: Bearer {Access Token} where {Access Token} is obtained from the response of the /login method.

Get authentication tokens using account credentials.
This endpoint returns authorization tokens for a specific Account Number and Account Password. Once new tokens are generated, the previously generated ones are deactivated.

Request Body schema: application/json
required
BotId
required
integer <int64> (BotId)
System account number

Password
required
string
Account Password

Responses
200 Success
default Error response

post
/login

Request samples
Payload
Content type
application/json

Copy
{
"BotId": 0,
"Password": "string"
}
Response samples
200default
Content type
application/json

Copy
{
"AccessToken": "string",
"RefreshToken": "string"
}
Regenerate authentication tokens using a `Refresh Token`.
This endpoint returns regenerated authorization tokens for a specific Account Number and Refresh Token. It is used in scenarios where the Access Token has expired but the Refresh Token remains valid.

Once new tokens are generated, the previously generated tokens are deactivated. If both tokens are expired, the /login endpoint should be used to generate new tokens.

Request Body schema: application/json
required
BotId
required
integer <int64> (BotId)
System account number

RefreshToken
required
string (RefreshToken)
Long-lived token used to obtain a new access token to replace an expired one

Responses
200 Success
default Error response

post
/refresh

Request samples
Payload
Content type
application/json

Copy
{
"BotId": 0,
"RefreshToken": "string"
}
Response samples
200default
Content type
application/json

Copy
{
"AccessToken": "string",
"RefreshToken": "string"
}
Accounts
Get general account information.
This endpoint returns a general overview of a specific account identified by the Access Token.

Authorizations:
BearerAuth
Responses
200 Success
default Error response

get
/accountinfo

Response samples
200default
Content type
application/json

Copy
{
"Login": 0,
"ActualVersion": 0,
"Name": "string",
"Description": "string",
"IsDemo": true,
"IsTradeEnabled": true,
"IsSwapEnabled": true
}
Margin
Get the current financial state of the account, including open positions and pending orders.
This endpoint returns the current financial state, a list of open positions and pending orders of a specific account identified by the Access Token.

Authorizations:
BearerAuth
Responses
200 Success
default Error response

get
/accountstate

Response samples
200default
Content type
application/json

Copy
Expand allCollapse all
{
"AccountState": {
"Login": 0,
"Balance": 0.1,
"Credit": 0.1,
"Equity": 0.1,
"Margin": 0.1,
"Leverage": 0,
"OpenProfit": 0.1
},
"OrderStates": [
{}
]
}
Orders
Create a new trading order.
This endpoint creates and sends market and pending orders.

Authorizations:
BearerAuth
Request Body schema: application/json
required
ClientOrderId	
string
A client Order identifier. It must be unique within a specific trading account

Symbol
required
string
Trade symbol the order is created for. It must match the one obtained in the /symbollist method

OrderSide
required
string (OrderSide)
Enum: "BUY" "SELL"
Order direction

OrderType
required
string (OrderType)
Enum: "MARKET" "LIMIT" "STOP"
Order type

OrderTimeInForce	
string (OrderTimeInForce)
Enum: "GTC" "IOC" "FOK" "DAY"
Order execution method. “IOC” is applied by default, if not explicitly requested

Price	
number <double>
Limit-order price (for limit orders only)

StopPrice	
number <double>
Stop-order price (for stop orders only)

TakeProfit	
number <double>
Take-profit price

StopLoss	
number <double>
Stop-loss price

Amount
required
number <double>
Requested amount (in units)

Comment	
string
User-defined comment

Responses
200 Success
default Error response

post
/sendorder

Request samples
Payload
Content type
application/json

Copy
{
"ClientOrderId": "string",
"Symbol": "string",
"OrderSide": "BUY",
"OrderType": "MARKET",
"OrderTimeInForce": "GTC",
"Price": 0.1,
"StopPrice": 0.1,
"TakeProfit": 0.1,
"StopLoss": 0.1,
"Amount": 0.1,
"Comment": "string"
}
Response samples
200default
Content type
application/json

Copy
Expand allCollapse all
{
"Order": {
"Login": 0,
"OrderId": 0,
"ClientOrderId": "string",
"ActualVersion": 0,
"Symbol": "string",
"OrderSide": "BUY",
"OrderType": "MARKET",
"OrderInitialType": "MARKET",
"OrderSource": "UNKNOWN",
"OrderTimeInForce": "GTC",
"OrderStatus": "INVALID",
"Price": 0.1,
"StopPrice": 0.1,
"TakeProfit": 0.1,
"StopLoss": 0.1,
"Amount": 0.1,
"Comment": "string",
"CreatedTimestamp": 0,
"ModifiedTimestamp": 0,
"SocialTradingOrderType": "REGULAR"
}
}
Get a list of pending orders.
This endpoint returns a list of the existing pending orders.

Authorizations:
BearerAuth
Responses
200 Success
default Error response

get
/orderlist

Response samples
200default
Content type
application/json

Copy
Expand allCollapse all
{
"Orders": [
{}
]
}
Cancel an existing pending order.
This endpoint cancels a specific pending order.

Authorizations:
BearerAuth
Request Body schema: application/json
required
One of objectobject
OrderId
required
integer <int64> (OrderId)
System order identifier

Responses
200 Success
default Error response

post
/cancelorder

Request samples
Payload
Content type
application/json

Copy
{
"ClientOrderId": "string"
}
Response samples
200default
Content type
application/json

Copy
{ }
Positions
Get position open profit and loss.
This endpoint returns open profit and loss for a specific order.

Authorizations:
BearerAuth
Request Body schema: application/json
required
OrderId
required
integer <int64> (OrderId)
System order identifier

Responses
200 Success
default Error response

post
/position

Request samples
Payload
Content type
application/json

Copy
{
"OrderId": 0
}
Response samples
200default
Content type
application\json

Copy
{
"Profit": 0.1
}
Get a list of open positions.
This endpoint returns a list of the existing open positions.

Authorizations:
BearerAuth
Responses
200 Success
default Error response

get
/positionlist

Response samples
200default
Content type
application/json

Copy
Expand allCollapse all
{
"Orders": [
{}
]
}
Close an existing open position.
This endpoint closes a specific open position, including a partial close.

Authorizations:
BearerAuth
Request Body schema: application/json
required
One of objectobject
OrderId
required
integer <int64> (OrderId)
System order identifier

CloseAmount	
number <double>
Responses
200 Success
default Error response

post
/closeposition

Request samples
Payload
Content type
application/json

Copy
{
"ClientOrderId": "string",
"CloseAmount": 0.1
}
Response samples
200default
Content type
application/json

Copy
{ }
Price subscription
Subscribe to real-time market quotes.
This endpoint enables subscription to real-time market quotes for a specific symbol via a WebSocket connection. This method is available once a WebSocket connection has been established. The subscription is canceled if the WebSocket connection is terminated.

Authorizations:
BearerAuth
Request Body schema: application/json
required
Symbol
required
string (Symbol)
Trade symbol

Responses
200 Success
default Error response

post
/subscribe

Request samples
Payload
Content type
application/json

Copy
{
"Symbol": "string"
}
Response samples
200default
Content type
application/json

Copy
{ }
Unsubscribe from real-time market quotes.
This endpoint terminates the subscription to real-time market quotes for a specific symbol or all symbols simultaneously.

Authorizations:
BearerAuth
Request Body schema: application/json
required
Symbol	
string (Symbol)
Trade symbol

Responses
200 Success
default Error response

post
/unsubscribe

Request samples
Payload
Content type
application/json

Copy
{
"Symbol": "string"
}
Response samples
200default
Content type
application/json

Copy
{ }
Symbols
Get symbol specifications.
This endpoint returns a specific symbol specification.

Authorizations:
BearerAuth
Request Body schema: application/json
required
Symbol
required
string (Symbol)
Trade symbol

Responses
200 Success
default Error response




get
/servertime

Response samples
200default
Content type
application/json

Copy
{
"NanosecondsFromEpoch": 0
}
Authorization
Authorization is required for all API requests, excluding /servertime, /login and /refresh. The authorization HTTP header is used for this purpose: Authorization: Bearer {Access Token} where {Access Token} is obtained from the response of the /login method.

Get authentication tokens using account credentials.
This endpoint returns authorization tokens for a specific Account Number and Account Password. Once new tokens are generated, the previously generated ones are deactivated.

Request Body schema: application/json
required
BotId
required
integer <int64> (BotId)
System account number

Password
required
string
Account Password

Responses
200 Success
default Error response

post
/login

Request samples
Payload
Content type
application/json

Copy
{
"BotId": 0,
"Password": "string"
}
Response samples
200default
Content type
application/json

Copy
{
"AccessToken": "string",
"RefreshToken": "string"
}
Regenerate authentication tokens using a `Refresh Token`.
This endpoint returns regenerated authorization tokens for a specific Account Number and Refresh Token. It is used in scenarios where the Access Token has expired but the Refresh Token remains valid.

Once new tokens are generated, the previously generated tokens are deactivated. If both tokens are expired, the /login endpoint should be used to generate new tokens.

Request Body schema: application/json
required
BotId
required
integer <int64> (BotId)
System account number

RefreshToken
required
string (RefreshToken)
Long-lived token used to obtain a new access token to replace an expired one

Responses
200 Success
default Error response

post
/refresh

Request samples
Payload
Content type
application/json

Copy
{
"BotId": 0,
"RefreshToken": "string"
}
Response samples
200default
Content type
application/json

Copy
{
"AccessToken": "string",
"RefreshToken": "string"
}
Accounts
Get general account information.
This endpoint returns a general overview of a specific account identified by the Access Token.

Authorizations:
BearerAuth
Responses
200 Success
default Error response

get
/accountinfo

Response samples
200default
Content type
application/json

Copy
{
"Login": 0,
"ActualVersion": 0,
"Name": "string",
"Description": "string",
"IsDemo": true,
"IsTradeEnabled": true,
"IsSwapEnabled": true
}
Margin
Get the current financial state of the account, including open positions and pending orders.
This endpoint returns the current financial state, a list of open positions and pending orders of a specific account identified by the Access Token.

Authorizations:
BearerAuth
Responses
200 Success
default Error response

get
/accountstate

Response samples
200default
Content type
application/json

Copy
Expand allCollapse all
{
"AccountState": {
"Login": 0,
"Balance": 0.1,
"Credit": 0.1,
"Equity": 0.1,
"Margin": 0.1,
"Leverage": 0,
"OpenProfit": 0.1
},
"OrderStates": [
{}
]
}
Orders
Create a new trading order.
This endpoint creates and sends market and pending orders.

Authorizations:
BearerAuth
Request Body schema: application/json
required
ClientOrderId	
string
A client Order identifier. It must be unique within a specific trading account

Symbol
required
string
Trade symbol the order is created for. It must match the one obtained in the /symbollist method

OrderSide
required
string (OrderSide)
Enum: "BUY" "SELL"
Order direction

OrderType
required
string (OrderType)
Enum: "MARKET" "LIMIT" "STOP"
Order type

OrderTimeInForce	
string (OrderTimeInForce)
Enum: "GTC" "IOC" "FOK" "DAY"
Order execution method. “IOC” is applied by default, if not explicitly requested

Price	
number <double>
Limit-order price (for limit orders only)

StopPrice	
number <double>
Stop-order price (for stop orders only)

TakeProfit	
number <double>
Take-profit price

StopLoss	
number <double>
Stop-loss price

Amount
required
number <double>
Requested amount (in units)

Comment	
string
User-defined comment

Responses
200 Success
default Error response

post
/sendorder

Request samples
Payload
Content type
application/json

Copy
{
"ClientOrderId": "string",
"Symbol": "string",
"OrderSide": "BUY",
"OrderType": "MARKET",
"OrderTimeInForce": "GTC",
"Price": 0.1,
"StopPrice": 0.1,
"TakeProfit": 0.1,
"StopLoss": 0.1,
"Amount": 0.1,
"Comment": "string"
}
Response samples
200default
Content type
application/json

Copy
Expand allCollapse all
{
"Order": {
"Login": 0,
"OrderId": 0,
"ClientOrderId": "string",
"ActualVersion": 0,
"Symbol": "string",
"OrderSide": "BUY",
"OrderType": "MARKET",
"OrderInitialType": "MARKET",
"OrderSource": "UNKNOWN",
"OrderTimeInForce": "GTC",
"OrderStatus": "INVALID",
"Price": 0.1,
"StopPrice": 0.1,
"TakeProfit": 0.1,
"StopLoss": 0.1,
"Amount": 0.1,
"Comment": "string",
"CreatedTimestamp": 0,
"ModifiedTimestamp": 0,
"SocialTradingOrderType": "REGULAR"
}
}
Get a list of pending orders.
This endpoint returns a list of the existing pending orders.

Authorizations:
BearerAuth
Responses
200 Success
default Error response

get
/orderlist

Response samples
200default
Content type
application/json

Copy
Expand allCollapse all
{
"Orders": [
{}
]
}
Cancel an existing pending order.
This endpoint cancels a specific pending order.

Authorizations:
BearerAuth
Request Body schema: application/json
required
One of objectobject
OrderId
required
integer <int64> (OrderId)
System order identifier

Responses
200 Success
default Error response

post
/cancelorder

Request samples
Payload
Content type
application/json

Copy
{
"ClientOrderId": "string"
}
Response samples
200default
Content type
application/json

Copy
{ }
Positions
Get position open profit and loss.
This endpoint returns open profit and loss for a specific order.

Authorizations:
BearerAuth
Request Body schema: application/json
required
OrderId
required
integer <int64> (OrderId)
System order identifier

Responses
200 Success
default Error response

post
/position

Request samples
Payload
Content type
application/json

Copy
{
"OrderId": 0
}
Response samples
200default
Content type
application\json

Copy
{
"Profit": 0.1
}
Get a list of open positions.
This endpoint returns a list of the existing open positions.

Authorizations:
BearerAuth
Responses
200 Success
default Error response

get
/positionlist

Response samples
200default
Content type
application/json

Copy
Expand allCollapse all
{
"Orders": [
{}
]
}
Close an existing open position.
This endpoint closes a specific open position, including a partial close.

Authorizations:
BearerAuth
Request Body schema: application/json
required
One of objectobject
OrderId
required
integer <int64> (OrderId)
System order identifier

CloseAmount	
number <double>
Responses
200 Success
default Error response

post
/closeposition

Request samples
Payload
Content type
application/json

Copy
{
"ClientOrderId": "string",
"CloseAmount": 0.1
}
Response samples
200default
Content type
application/json

Copy
{ }
Price subscription
Subscribe to real-time market quotes.
This endpoint enables subscription to real-time market quotes for a specific symbol via a WebSocket connection. This method is available once a WebSocket connection has been established. The subscription is canceled if the WebSocket connection is terminated.

Authorizations:
BearerAuth
Request Body schema: application/json
required
Symbol
required
string (Symbol)
Trade symbol

Responses
200 Success
default Error response

post
/subscribe

Request samples
Payload
Content type
application/json

Copy
{
"Symbol": "string"
}
Response samples
200default
Content type
application/json

Copy
{ }
Unsubscribe from real-time market quotes.
This endpoint terminates the subscription to real-time market quotes for a specific symbol or all symbols simultaneously.

Authorizations:
BearerAuth
Request Body schema: application/json
required
Symbol	
string (Symbol)
Trade symbol

Responses
200 Success
default Error response

post
/unsubscribe

Request samples
Payload
Content type
application/json

Copy
{
"Symbol": "string"
}
Response samples
200default
Content type
application/json

Copy
{ }
Symbols
Get symbol specifications.
This endpoint returns a specific symbol specification.

Authorizations:
BearerAuth
Request Body schema: application/json
required
Symbol
required
string (Symbol)
Trade symbol

Responses
200 Success
default Error response

post
/symbolinfo

Request samples
Payload
Content type
application/json

Copy
{
"Symbol": "string"
}
Response samples
200default
Content type
application/json

Copy
Expand allCollapse all
{
"Name": "string",
"Description": "string",
"Precision": 0,
"MarginCurrency": "string",
"MarginCurrencyPrecision": 0,
"MarginCalculationType": "CFD",
"ProfitCurrency": "string",
"ProfitCurrencyPrecision": 0,
"ProfitCalculationType": "CFD",
"IsTradeAllowed": true,
"ContractSize": 0.1,
"MinTradeAmount": 0.1,
"MaxTradeAmount": 0.1,
"TradeAmountStep": 0.1,
"IsSwapEnabled": true,
"SwapSettings": {
"Type": "BY_POINTS",
"Long": 0.1,
"Short": 0.1,
"TripleDay": "SUNDAY",
"DaysInYear": 0
},
"TradingMode": "NORMAL",
"SymbolGroupName": "string",
"StopsLevel": 0,
"InitialMargin": 0.1,
"HedgedMargin": 0.1
}
Get a list of available symbols with their specifications.
This endpoint returns a list available symbols with their specifications.

Authorizations:
BearerAuth
Responses
200 Success
default Error response

get
/symbollist

Response samples
200default
Content type
application/json

Copy
Expand allCollapse all
{
"Symbols": [
{}
]
}
Price
Get symbol market quotes.
This endpoint returns market quotes for a specific symbol.

Authorizations:
BearerAuth
Request Body schema: application/json
required
Symbol
required
string (Symbol)
Trade symbol

Responses
200 Success
default Error response

post
/price

Request samples
Payload
Content type
application/json

Copy
{
"Symbol": "string"
}
Response samples
200default
Content type
application/json

Copy
Expand allCollapse all
{
"Symbol": "string",
"Tick": {
"Time": 0,
"Bid": {},
"Ask": {}
}
}
Candles
Get candlestick chart specifications.
This endpoint returns candlestick chart specifications for a particular symbol, timeframe and date range.

Request Body schema: application/json
required
Symbol
required
string (Symbol)
Trade symbol

PeriodType
required
string (ChartBarPeriodType)
Enum: "M1" "M5" "M15" "M30" "H1" "H4" "D1" "W1" "MN"
Candlestick timeframe

FromTimestamp
required
integer <int64>
FROM-point for candlestick chart (in nanoseconds from epoch, UTC)

ToTimestamp
required
integer <int64>
TO-point for candlestick chart (in nanoseconds from epoch, UTC)

Limit	
integer <int32>
Maximum number of candlesticks to return

Responses
200 Success
default Error response

post
/candle

Request samples
Payload
Content type
application/json

Copy
{
"Symbol": "string",
"PeriodType": "M1",
"FromTimestamp": 0,
"ToTimestamp": 0,
"Limit": 0
}
Response samples
200default
Content type
application/json

Copy
Expand allCollapse all
{
"ChartBars": [
{}
]
}
History
Get trading history.
This endpoint returns execution reports (trading history) for a specific account identified by the Access Token. It reflects history for a particular order or for all orders within a specified timeframe.

Authorizations:
BearerAuth
Request Body schema: application/json
required
RequestDirection
required
string (RequestDirection)
Enum	Description
FORWARD	Returns data from oldest to newest (chronological order)
BACKWARD	Returns data from newest to oldest (reverse chronological order)
Direction for retrieving trading history data

RequestFrom	
integer <int64>
Trading history FROM-timestamp (in nanoseconds from epoch, UTC)

RequestTo	
integer <int64>
Trading history TO-timestamp (in nanoseconds from epoch, UTC)

OrderId	
integer <int64> (OrderId)
System order identifier

LastRecordId	
integer <int64>
Record Id to return a trading history starting from

PageSize	
integer <int32>
Number of trading history records to return in a response

Responses
200 Success
default Error response

post
/tradehistory

Request samples
Payload
Content type
application/json

Copy
{
"RequestDirection": "FORWARD",
"RequestFrom": 0,
"RequestTo": 0,
"OrderId": 0,
"LastRecordId": 0,
"PageSize": 0
}
Response samples
200default
Content type
application/json

Copy
Expand allCollapse all
{
"LastRecordId": 0,
"TradeHistory": [
{}
]
}
WebSocket
Establish a WebSocket connection.
The WebSocket connection provides real-time market quotes and execution reports (trading history). Execution reports are sent upon connection establishment. Real-time market quotes are transmitted upon subscription to the corresponding symbol via the /subscribe method.

An HTTP upgrade request is used to establish a WebSocket connection from an existing HTTP connection. The Authorization HTTP header, which is identical to the one used for API requests Authorization: Bearer {Access Token}, must be included in the upgrade request.

If Access Token is regenerated, the connection is terminated.

WebSocket connections use a different port number than the one used for the API.

The connection URL: wss://SERVER:PORT/api/v1

where

SERVER is the same domain name or IP address used for the API
PORT is the WebSocket port number
The wss: scheme ensures a secure connection; the unsecure ws: scheme is not supported.

Authorizations:
BearerAuth
Responses
200 On success, notifications of the following types are streamed into the WebSocket connection.
default Error response

get
/

Response samples
200default
Content type
application/json
Example

ExecutionReportNotification
ExecutionReportNotification

Copy
Expand allCollapse all
{
"ExecutionReport": {
"RecordId": 0,
"Login": 0,
"ExternalClientId": "string",
"TransactionType": "ORDER_OPENED",
"TransactionReason": "UNKNOWN",
"TransactionTimestamp": 0,
"ClientComment": "string",
"BalanceMovement": 0.1,
"BalanceResult": 0.1,
"OrderId": 0,
"ClientOrderId": "string",
"Symbol": "string",
"OrderSide": "BUY",
"OrderType": "MARKET",
"OrderInitialType": "MARKET",
"OrderSource": "UNKNOWN",
"OrderTimeInForce": "GTC",
"OrderStatus": "INVALID",
"LimitPrice": 0.1,
"StopPrice": 0.1,
"TakeProfit": 0.1,
"StopLoss": 0.1,
"Amount": 0.1,
"RemainingAmount": 0.1,
"CreateTimestamp": 0,
"ModifyTimestamp": 0,
"OpenTimestamp": 0,
"OpenPrice": 0.1,
"OpenAmount": 0.1,
"OpenMarginRate": 0.1,
"CloseTimestamp": 0,
"ClosePrice": 0.1,
"CloseAmount": 0.1,
"CloseMarginRate": 0.1,
"Profit": 0.1,
"ProfitConversionRate": 0.1,
"Commission": 0.1,
"Swap": 0.1,
"ManagerComment": "string"
}
}