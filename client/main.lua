-- client/main.lua (o como lo tengas declarado en fxmanifest)

local uiOpen = false
local adminStates = {
    godmode = false,
    noclip = false,
    invisible = false,
    moveSpeedIndex = 1
}

local frozen = false

local moveSpeedOptions = {
    { label = 'Velocidad normal', multiplier = 1.0 },
    { label = 'Velocidad +25%', multiplier = 1.25 },
    { label = 'Velocidad +50%', multiplier = 1.5 }
}

local function notify(title, description, type)
    lib.notify({
        title = title,
        description = description,
        type = type or 'inform'
    })
end

-- Comando para abrir / cerrar admin (Quick por defecto)
RegisterCommand('admin', function()
    uiOpen = not uiOpen

    SetNuiFocus(uiOpen, uiOpen)
    SendNUIMessage({
        action = 'setVisible',
        data = uiOpen,
        mode = 'quick' -- ya lo usas en tu App
    })
end, false)

-- Por si quieres un keymapping
RegisterKeyMapping('admin', 'Abrir panel de administración', 'keyboard', 'F10')

------------------------------------------------------------------
-- NUI callback: acciones del Quick Admin
------------------------------------------------------------------
RegisterNUICallback('quickAction', function(data, cb)
    local groupId = data.groupId
    local actionId = data.actionId
    local payload = data.payload

    print(('[oxe_admin] quickAction %s -> %s'):format(groupId, actionId))

    -- Para ejemplo, implementamos algunas acciones reales:
    if groupId == 'self' then
        handleSelfAction(actionId)
    elseif groupId == 'teleport' then
        handleTeleportAction(actionId, payload)
    elseif groupId == 'server' then
        handleServerAction(actionId, payload)
    elseif groupId == 'vehicles' then
        handleVehicleAction(actionId)
    -- props / players los rellenamos luego
    end

    if cb then cb({ ok = true }) end
end)

------------------------------------------------------------------
-- Acciones: Jugador (self)
------------------------------------------------------------------
function handleSelfAction(actionId)
    local ped = PlayerPedId()

    if actionId == 'self_heal' then
        SetEntityHealth(ped, 200)
        ClearPedBloodDamage(ped)
        ClearPedTasksImmediately(ped)
        lib.notify({
            title = 'Quick Admin',
            description = 'Te has curado / revivido.',
            type = 'success'
        })

    elseif actionId == 'self_clear_blood' then
        ClearPedBloodDamage(ped)
        lib.notify({
            title = 'Quick Admin',
            description = 'Has limpiado la sangre y suciedad.',
            type = 'inform'
        })

    elseif actionId == 'self_godmode' then
        toggleGodmode()

    elseif actionId == 'self_noclip' then
        toggleNoclip()

    elseif actionId == 'self_invisible' then
        toggleInvisibility()

    elseif actionId == 'self_move_speed' then
        cycleMoveSpeed()

    else
        lib.notify({
            title = 'Quick Admin',
            description = ('Acción self no implementada: %s'):format(actionId),
            type = 'error'
        })
    end
end

local godmode = false
function toggleGodmode()
    godmode = not godmode
    local ped = PlayerPedId()
    SetEntityInvincible(ped, godmode)
    SetPlayerInvincible(PlayerId(), godmode)

    adminStates.godmode = godmode

    notify('Quick Admin', godmode and 'Godmode activado.' or 'Godmode desactivado.', 'success')
end

local noclip = false
function toggleNoclip()
    noclip = not noclip
    local ped = PlayerPedId()
    SetEntityCollision(ped, not noclip, not noclip)
    FreezeEntityPosition(ped, false) -- truquito light
    SetEntityInvincible(ped, noclip or adminStates.godmode)

    adminStates.noclip = noclip

    notify('Quick Admin', noclip and 'Noclip activado (WASD, espacio, ctrl).' or 'Noclip desactivado.', 'success')

    if noclip then
        CreateThread(function()
            while noclip do
                local ped = PlayerPedId()
                local pos = GetEntityCoords(ped)
                local camRot = GetGameplayCamRot(2)
                local heading = math.rad(camRot.z)

                local speed = 1.5
                if IsControlPressed(0, 21) then -- shift
                    speed = 4.0
                end

                local offset = vector3(0, 0, 0)

                -- W / S adelante / atrás
                if IsControlPressed(0, 32) then -- W
                    offset = offset + vector3(math.sin(heading) * speed, math.cos(heading) * speed, 0.0)
                end
                if IsControlPressed(0, 33) then -- S
                    offset = offset - vector3(math.sin(heading) * speed, math.cos(heading) * speed, 0.0)
                end

                -- A / D laterales
                if IsControlPressed(0, 34) then -- A
                    offset = offset + vector3(math.sin(heading - math.pi/2) * speed, math.cos(heading - math.pi/2) * speed, 0.0)
                end
                if IsControlPressed(0, 35) then -- D
                    offset = offset + vector3(math.sin(heading + math.pi/2) * speed, math.cos(heading + math.pi/2) * speed, 0.0)
                end

                -- Espacio / Ctrl subir-bajar
                if IsControlPressed(0, 22) then -- SPACE
                    offset = offset + vector3(0.0, 0.0, speed)
                end
                if IsControlPressed(0, 36) then -- CTRL
                    offset = offset - vector3(0.0, 0.0, speed)
                end

                SetEntityCoordsNoOffset(ped, pos.x + offset.x, pos.y + offset.y, pos.z + offset.z, true, true, true)
                Wait(0)
            end

            local ped = PlayerPedId()
            SetEntityCollision(ped, true, true)
            FreezeEntityPosition(ped, false)
            SetEntityInvincible(ped, adminStates.godmode)
        end)
    end
end

local function toggleInvisibility()
    adminStates.invisible = not adminStates.invisible

    local ped = PlayerPedId()
    SetEntityVisible(ped, not adminStates.invisible, false)
    SetEntityAlpha(ped, adminStates.invisible and 0 or 255, false)

    notify('Quick Admin', adminStates.invisible and 'Invisibilidad activada.' or 'Invisibilidad desactivada.', 'success')
end

local function setMoveSpeed(multiplier, label)
    SetRunSprintMultiplierForPlayer(PlayerId(), multiplier)
    SetSwimMultiplierForPlayer(PlayerId(), multiplier)
    notify('Quick Admin', ('Velocidad: %s'):format(label), 'success')
end

local function cycleMoveSpeed()
    adminStates.moveSpeedIndex = adminStates.moveSpeedIndex + 1
    if adminStates.moveSpeedIndex > #moveSpeedOptions then
        adminStates.moveSpeedIndex = 1
    end

    local option = moveSpeedOptions[adminStates.moveSpeedIndex]
    setMoveSpeed(option.multiplier, option.label)
end

local function resetStates()
    local ped = PlayerPedId()
    noclip = false
    adminStates.noclip = false
    adminStates.godmode = false
    adminStates.invisible = false
    adminStates.moveSpeedIndex = 1
    frozen = false

    SetEntityCollision(ped, true, true)
    FreezeEntityPosition(ped, false)
    SetEntityInvincible(ped, false)
    SetPlayerInvincible(PlayerId(), false)
    SetEntityVisible(ped, true, false)
    SetEntityAlpha(ped, 255, false)
    SetRunSprintMultiplierForPlayer(PlayerId(), moveSpeedOptions[1].multiplier)
    SetSwimMultiplierForPlayer(PlayerId(), moveSpeedOptions[1].multiplier)
end

local function getCoordsForServerId(targetId)
    local coords

    local success = pcall(function()
        if exports.ox_core and exports.ox_core.GetPlayerCoords then
            coords = exports.ox_core:GetPlayerCoords(targetId)
        end
    end)

    if success and coords then
        if coords.xyz then
            return coords.xyz
        end

        if coords.x then
            return vector3(coords.x, coords.y, coords.z)
        end
    end

    local player = GetPlayerFromServerId(targetId)
    if player ~= -1 then
        return GetEntityCoords(GetPlayerPed(player))
    end

    return nil
end

local function teleportSelf(coords)
    local ped = PlayerPedId()
    SetEntityCoordsNoOffset(ped, coords.x, coords.y, coords.z, false, false, false)
end

local function teleportServerIdToCoords(targetId, coords)
    local ok, result = pcall(function()
        if exports.ox_core and exports.ox_core.SetPlayerCoords then
            return exports.ox_core:SetPlayerCoords(targetId, coords)
        end
    end)

    if ok and result ~= nil then
        return result
    end

    if targetId == GetPlayerServerId(PlayerId()) then
        teleportSelf(coords)
        return true
    end

    return false
end

------------------------------------------------------------------
-- Acciones: Teleport
------------------------------------------------------------------
function handleTeleportAction(actionId, payload)
    local ped = PlayerPedId()

    if actionId == 'tp_waypoint' then
        local blip = GetFirstBlipInfoId(8)
        if blip ~= 0 then
            local coords = GetBlipInfoIdCoord(blip)
            SetEntityCoordsNoOffset(ped, coords.x, coords.y, coords.z + 1.0, false, false, false)
            lib.notify({
                title = 'Quick Admin',
                description = 'Teletransportado al waypoint.',
                type = 'success'
            })
        else
            lib.notify({
                title = 'Quick Admin',
                description = 'No tienes ningún waypoint marcado.',
                type = 'error'
            })
        end

    elseif actionId == 'tp_coords' then
        if payload and type(payload.x) == 'number' and type(payload.y) == 'number' and type(payload.z) == 'number' then
            SetEntityCoordsNoOffset(ped, payload.x + 0.0, payload.y + 0.0, payload.z + 0.0, false, false, false)
            lib.notify({
                title = 'Quick Admin',
                description = ('Teletransportado a: %.2f, %.2f, %.2f'):format(payload.x, payload.y, payload.z),
                type = 'success'
            })
        else
            lib.notify({
                title = 'Quick Admin',
                description = 'Coordenadas inválidas recibidas desde NUI.',
                type = 'error'
            })
        end

    elseif actionId == 'coords_copy_vec3' or actionId == 'coords_copy_vec4' then
        local coords = GetEntityCoords(ped)
        local heading = GetEntityHeading(ped)

        local text
        if actionId == 'coords_copy_vec3' then
            text = ("vector3(%.2f, %.2f, %.2f)"):format(coords.x, coords.y, coords.z)
        else
            text = ("vector4(%.2f, %.2f, %.2f, %.2f)"):format(coords.x, coords.y, coords.z, heading)
        end

        if lib and lib.setClipboard then
            lib.setClipboard(text)
        end

        notify('Quick Admin', 'Coordenadas copiadas: ' .. text, 'inform')
        print('[oxe_admin] Coords copiadas: ' .. text)
    end
end

------------------------------------------------------------------
-- Acciones: Servidor (demo)
------------------------------------------------------------------
function handleServerAction(actionId, payload)
    if actionId == 'srv_announce' then
        local text = payload and payload.text
        if type(text) == 'string' and text ~= '' then
            TriggerServerEvent('oxe_admin:server:announce', text)
        else
            lib.notify({
                title = 'Quick Admin',
                description = 'El anuncio no puede ir vacío.',
                type = 'error'
            })
        end
    elseif actionId == 'srv_cleanup' then
        TriggerServerEvent('oxe_admin:server:cleanup')
    else
        lib.notify({
            title = 'Quick Admin',
            description = ('Acción server no implementada: %s'):format(actionId),
            type = 'inform'
        })
    end
end

------------------------------------------------------------------
-- Acciones: Vehículos (demo light)
------------------------------------------------------------------
function handleVehicleAction(actionId)
    local ped = PlayerPedId()
    local veh = GetVehiclePedIsIn(ped, false)
    if veh == 0 and actionId ~= 'veh_spawn' then
        lib.notify({
            title = 'Quick Admin',
            description = 'No estás en ningún vehículo.',
            type = 'error'
        })
        return
    end

    if actionId == 'veh_fix' then
        SetVehicleFixed(veh)
        SetVehicleDeformationFixed(veh)
        lib.notify({
            title = 'Quick Admin',
            description = 'Vehículo reparado.',
            type = 'success'
        })
    elseif actionId == 'veh_clean' then
        SetVehicleDirtLevel(veh, 0.0)
        lib.notify({
            title = 'Quick Admin',
            description = 'Vehículo limpiado.',
            type = 'success'
        })
    elseif actionId == 'veh_delete' then
        DeleteEntity(veh)
        notify('Quick Admin', 'Vehículo eliminado.', 'success')
    elseif actionId == 'veh_fuel_max' then
        SetVehicleFuelLevel(veh, 100.0)
        notify('Quick Admin', 'Depósito rellenado al máximo.', 'success')
    elseif actionId == 'veh_flip' then
        SetVehicleOnGroundProperly(veh)
        notify('Quick Admin', 'Vehículo volteado.', 'success')
    else
        lib.notify({
            title = 'Quick Admin',
            description = ('Acción vehículo no implementada: %s'):format(actionId),
            type = 'inform'
        })
    end
end

------------------------------------------------------------------
-- Eventos compartidos con el servidor
------------------------------------------------------------------
RegisterNetEvent('oxe_admin:client:openQuick', function()
    if not uiOpen then
        ExecuteCommand('admin')
        return
    end

    SetNuiFocus(true, true)
    SendNUIMessage({
        action = 'setVisible',
        data = true,
        mode = 'quick'
    })
end)

RegisterNetEvent('oxe_admin:client:toggleNoclip', toggleNoclip)
RegisterNetEvent('oxe_admin:client:toggleGodmode', toggleGodmode)
RegisterNetEvent('oxe_admin:client:toggleInvisible', toggleInvisibility)
RegisterNetEvent('oxe_admin:client:healSelf', function()
    handleSelfAction('self_heal')
end)
RegisterNetEvent('oxe_admin:client:clearBlood', function()
    handleSelfAction('self_clear_blood')
end)
RegisterNetEvent('oxe_admin:client:cycleMoveSpeed', cycleMoveSpeed)

RegisterNetEvent('oxe_admin:client:tpToWaypoint', function()
    handleTeleportAction('tp_waypoint')
end)

RegisterNetEvent('oxe_admin:client:tpToCoords', function(payload)
    if type(payload) ~= 'table' then
        notify('Quick Admin', 'Coordenadas inválidas.', 'error')
        return
    end

    local coords = vector3(tonumber(payload.x or 0.0), tonumber(payload.y or 0.0), tonumber(payload.z or 0.0))
    teleportSelf(coords)
    notify('Quick Admin', ('Teletransportado a %.2f, %.2f, %.2f'):format(coords.x, coords.y, coords.z), 'success')
end)

RegisterNetEvent('oxe_admin:client:copyCoordsVec3', function()
    handleTeleportAction('coords_copy_vec3')
end)

RegisterNetEvent('oxe_admin:client:copyCoordsVec4', function()
    handleTeleportAction('coords_copy_vec4')
end)

RegisterNetEvent('oxe_admin:client:tpToPlayer', function(targetId)
    targetId = tonumber(targetId)
    if not targetId then
        notify('Quick Admin', 'ID de jugador inválido para TP.', 'error')
        return
    end

    local coords = getCoordsForServerId(targetId)
    if not coords then
        notify('Quick Admin', 'No se encontraron coordenadas del jugador.', 'error')
        return
    end

    teleportSelf(coords + vector3(0.0, 0.0, 1.0))
    notify('Quick Admin', ('Teletransportado hasta el jugador %d.'):format(targetId), 'success')
end)

RegisterNetEvent('oxe_admin:client:bringPlayer', function(targetId)
    targetId = tonumber(targetId)
    if not targetId then
        notify('Quick Admin', 'ID de jugador inválido para Bring.', 'error')
        return
    end

    local coords = GetEntityCoords(PlayerPedId()) + vector3(1.0, 0.0, 0.0)
    if teleportServerIdToCoords(targetId, coords) then
        notify('Quick Admin', ('Has traído al jugador %d.'):format(targetId), 'success')
    else
        notify('Quick Admin', 'No se pudo mover al jugador (export de ox_core ausente).', 'error')
    end
end)

RegisterNetEvent('oxe_admin:client:tpBring', function(targetId)
    TriggerEvent('oxe_admin:client:bringPlayer', targetId)
end)

RegisterNetEvent('oxe_admin:client:giveCoords', function(targetId)
    targetId = tonumber(targetId)
    local coords = targetId and getCoordsForServerId(targetId) or GetEntityCoords(PlayerPedId())
    local heading = targetId and GetEntityHeading(PlayerPedId()) or GetEntityHeading(PlayerPedId())
    coords = coords or GetEntityCoords(PlayerPedId())

    local text = ('vector4(%.2f, %.2f, %.2f, %.2f)'):format(coords.x, coords.y, coords.z, heading)
    if lib and lib.setClipboard then
        lib.setClipboard(text)
    end

    notify('Quick Admin', 'Coordenadas copiadas al portapapeles.', 'inform')
end)

RegisterNetEvent('oxe_admin:client:toggleFreeze', function()
    frozen = not frozen
    local ped = PlayerPedId()
    FreezeEntityPosition(ped, frozen)
    notify('Quick Admin', frozen and 'Jugador congelado.' or 'Jugador desbloqueado.', 'success')
end)

RegisterNetEvent('oxe_admin:client:spectatePlayer', function(targetId)
    notify('Quick Admin', ('Modo espectador a %s pendiente de implementar.'):format(targetId or '?'), 'inform')
end)

RegisterNetEvent('oxe_admin:client:fixVehicle', function()
    handleVehicleAction('veh_fix')
end)

RegisterNetEvent('oxe_admin:client:cleanVehicle', function()
    handleVehicleAction('veh_clean')
end)

RegisterNetEvent('oxe_admin:client:deleteVehicle', function()
    handleVehicleAction('veh_delete')
end)

RegisterNetEvent('oxe_admin:client:fillFuel', function()
    handleVehicleAction('veh_fuel_max')
end)

RegisterNetEvent('oxe_admin:client:flipVehicle', function()
    handleVehicleAction('veh_flip')
end)

RegisterNetEvent('oxe_admin:client:editPropMode', function()
    notify('Quick Admin', 'Modo edición de props pendiente de implementar.', 'inform')
end)

RegisterNetEvent('oxe_admin:client:deleteProp', function()
    notify('Quick Admin', 'Eliminar props pendiente de implementar.', 'inform')
end)

RegisterNetEvent('oxe_admin:client:duplicateProp', function()
    notify('Quick Admin', 'Duplicar props pendiente de implementar.', 'inform')
end)

AddEventHandler('onResourceStop', function(resName)
    if resName ~= GetCurrentResourceName() then return end

    if uiOpen then
        uiOpen = false
        SetNuiFocus(false, false)
        SendNUIMessage({
            action = 'setVisible',
            data = false,
            mode = 'quick'
        })
    end

    resetStates()
end)
