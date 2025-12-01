---@author BEAST
---@resource oxe_administration
---@description Lado servidor para el panel de administración (Quick + Tablet)

local RESOURCE = GetCurrentResourceName()

-- Cambia esto si quieres desactivar los logs verbosos
local DEBUG = true

-- ACE que usaremos para dar permisos de admin
-- En server.cfg:
-- add_ace group.admin command.oxeadmin allow
local ADMIN_ACE = 'command.oxeadmin'

-- =====================================================================
-- Utils
-- =====================================================================

local function debug(msg, ...)
    if not DEBUG then return end
    local str = ('[%s] [DEBUG] %s'):format(RESOURCE, msg)
    print(str:format(...))
end

---Comprueba si un jugador tiene permiso de admin.
---@param src number
---@return boolean
local function isPlayerAdmin(src)
    -- Llamadas desde consola (src = 0) siempre permitidas
    if src <= 0 then
        return true
    end

    if IsPlayerAceAllowed(src, ADMIN_ACE) then
        return true
    end

    return false
end

-- =====================================================================
-- Eventos: abrir UI
-- =====================================================================

--- Petición desde el cliente para abrir el panel.
--- Útil si quieres abrir desde un comando tipo /admin y validar en el server.
RegisterNetEvent('oxe_admin:server:requestOpen', function()
    local src = source

    if not isPlayerAdmin(src) then
        debug('El jugador %d intentó abrir el panel sin permisos', src)
        -- Aquí podrías notificar con tu sistema de notificaciones del servidor
        return
    end

    debug('Abriendo panel de admin para %d', src)
    TriggerClientEvent('oxe_admin:client:openQuick', src)
end)

-- =====================================================================
-- Eventos: Quick Menu (acciones rápidas)
-- =====================================================================

--- Datos que esperamos desde el NUI/cliente.
---@class OxeQuickActionData
---@field groupId string  -- ej: "self", "players", "teleport"...
---@field variantId string -- ej: "self_noclip", "players_tp_to", etc.
---@field payload table|nil -- datos extra (id jugador, coords, etc.)

--- Evento genérico que dispara el cliente cuando el usuario pulsa Enter
--- en el Quick Menu. TODO: cablear desde QuickAdmin.tsx con TriggerServerEvent.
RegisterNetEvent('oxe_admin:server:quickAction', function(data)
    local src = source

    if not isPlayerAdmin(src) then
        debug('El jugador %d intentó usar QuickAdmin sin permisos', src)
        return
    end

    if type(data) ~= 'table' then
        debug('QuickAction recibió datos inválidos desde %d', src)
        return
    end

    local groupId   = data.groupId   or 'unknown_group'
    local variantId = data.variantId or 'unknown_variant'
    local payload   = data.payload   or {}

    debug('QuickAction de %d → %s :: %s', src, groupId, variantId)

    -- Aquí empieza el "router" de acciones.
    -- De momento solo ponemos ejemplos / stubs listos para implementar.

    -- =======================
    -- Grupo: Jugador (self)
    -- =======================
    if groupId == 'self' then
        if variantId == 'self_noclip' then
            -- Ejemplo: togglear noclip en el cliente
            TriggerClientEvent('oxe_admin:client:toggleNoclip', src)

        elseif variantId == 'self_godmode' then
            TriggerClientEvent('oxe_admin:client:toggleGodmode', src)

        elseif variantId == 'self_invisible' then
            TriggerClientEvent('oxe_admin:client:toggleInvisible', src)

        elseif variantId == 'self_heal' then
            TriggerClientEvent('oxe_admin:client:healSelf', src)

        elseif variantId == 'self_clear_blood' then
            TriggerClientEvent('oxe_admin:client:clearBlood', src)

        elseif variantId == 'self_clear_inventory' then
            -- Aquí lo normal será llamar a ox_inventory / qbx / lo que uses
            -- exports.ox_inventory:ClearInventory(src) -- EJEMPLO
            debug('→ Vaciar inventario propio (pendiente implementar)')

        elseif variantId == 'self_admin_weapon' then
            -- giveWeapon al jugador (usa tu sistema de armas)
            debug('→ Dar arma admin (pendiente implementar)')

        elseif variantId == 'self_move_speed' then
            TriggerClientEvent('oxe_admin:client:cycleMoveSpeed', src)
        end

    -- =======================
    -- Grupo: Jugadores
    -- =======================
    elseif groupId == 'players' then
        -- Aquí payload debería traer algo como payload.targetId
        local targetId = tonumber(payload.targetId or 0)

        if variantId == 'players_spectate' then
            TriggerClientEvent('oxe_admin:client:spectatePlayer', src, targetId)

        elseif variantId == 'players_tp_to' then
            TriggerClientEvent('oxe_admin:client:tpToPlayer', src, targetId)

        elseif variantId == 'players_bring' then
            TriggerClientEvent('oxe_admin:client:bringPlayer', src, targetId)

        elseif variantId == 'players_open_inventory' then
            debug('→ Abrir inventario de %d (pendiente implementar)', targetId)

        elseif variantId == 'players_clear_inventory' then
            debug('→ Vaciar inventario de %d (pendiente implementar)', targetId)

        elseif variantId == 'players_freeze' then
            TriggerClientEvent('oxe_admin:client:toggleFreeze', targetId)

        elseif variantId == 'players_jail' then
            debug('→ Enviar %d a jail (pendiente implementar)', targetId)

        elseif variantId == 'players_kick' then
            -- Kick directo desde servidor
            DropPlayer(targetId, 'Expulsado por administración.')

        elseif variantId == 'players_ban' then
            debug('→ Ban rápido de %d (pendiente integrar con tu sistema de bans)', targetId)
        end

    -- =======================
    -- Grupo: Teleport / Coords
    -- =======================
    elseif groupId == 'teleport' then
        if variantId == 'tp_waypoint' then
            TriggerClientEvent('oxe_admin:client:tpToWaypoint', src)

        elseif variantId == 'tp_coords' then
            -- payload.x, payload.y, payload.z
            TriggerClientEvent('oxe_admin:client:tpToCoords', src, payload)

        elseif variantId == 'coords_copy_vec3' then
            TriggerClientEvent('oxe_admin:client:copyCoordsVec3', src)

        elseif variantId == 'coords_copy_vec4' then
            TriggerClientEvent('oxe_admin:client:copyCoordsVec4', src)
        end

    -- =======================
    -- Grupo: Vehículos
    -- =======================
    elseif groupId == 'vehicles' then
        if variantId == 'veh_spawn' then
            debug('→ Spawnear vehículo admin (pendiente implementar)')

        elseif variantId == 'veh_fix' then
            TriggerClientEvent('oxe_admin:client:fixVehicle', src)

        elseif variantId == 'veh_clean' then
            TriggerClientEvent('oxe_admin:client:cleanVehicle', src)

        elseif variantId == 'veh_delete' then
            TriggerClientEvent('oxe_admin:client:deleteVehicle', src)

        elseif variantId == 'veh_give_keys' then
            debug('→ Dar llaves vehículo (pendiente integrar con tu sistema de llaves)')

        elseif variantId == 'veh_fuel_max' then
            TriggerClientEvent('oxe_admin:client:fillFuel', src)

        elseif variantId == 'veh_flip' then
            TriggerClientEvent('oxe_admin:client:flipVehicle', src)
        end

    -- =======================
    -- Grupo: Servidor
    -- =======================
    elseif groupId == 'server' then
        if variantId == 'srv_time_cycle' then
            debug('→ Cambiar hora (pendiente integrar con script de tiempo)')

        elseif variantId == 'srv_weather_cycle' then
            debug('→ Cambiar clima (pendiente integrar con script de clima)')

        elseif variantId == 'srv_freeze_time' then
            debug('→ Congelar hora (pendiente implementar)')

        elseif variantId == 'srv_freeze_weather' then
            debug('→ Congelar clima (pendiente implementar)')

        elseif variantId == 'srv_announce' then
            local msg = tostring(payload.message or 'Anuncio admin')
            TriggerClientEvent('chat:addMessage', -1, {
                args = { '^3[ADMIN]', msg }
            })

        elseif variantId == 'srv_cleanup' then
            debug('→ Cleanup de mundo (vehículos/cadáveres) pendiente implementar')
        end

    -- =======================
    -- Grupo: Props / Objetos
    -- =======================
    elseif groupId == 'props' then
        if variantId == 'props_spawn' then
            debug('→ Spawnear prop (pendiente implementar)')

        elseif variantId == 'props_edit' then
            TriggerClientEvent('oxe_admin:client:editPropMode', src)

        elseif variantId == 'props_delete' then
            TriggerClientEvent('oxe_admin:client:deleteProp', src)

        elseif variantId == 'props_duplicate' then
            TriggerClientEvent('oxe_admin:client:duplicateProp', src)
        end
    end
end)

-- =====================================================================
-- Log básico al arrancar el recurso
-- =====================================================================

AddEventHandler('onResourceStart', function(resName)
    if resName ~= RESOURCE then return end

    print(('[%s] Servidor cargado. Usa ACE "%s" para permisos de admin.')
        :format(RESOURCE, ADMIN_ACE))
end)
