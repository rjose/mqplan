
--==============================================================================
-- Local declarations
--
local RequestRouter = require('request_router')
local RequestParser = require('request_parser')
local Router = {}


--------------------------------------------------------------------------------
-- Routers
--
-- NOTE: When adding new routers, register them here.
--

RequestRouter.routers = {RequestRouter.static_file_router}

--==============================================================================
-- Public API
--

--------------------------------------------------------------------------------
-- Sends request through routers.
--
function Router.handle_request(req_string, body)
        local req = RequestParser.parse_request(req_string)
        req.body = body

        -- Share the Plan object with all requests
        req.plan = m_plan

        return RequestRouter.route_request(req)
end

return Router
