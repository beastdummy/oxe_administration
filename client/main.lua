-- client/main.lua (o como lo tengas declarado en fxmanifest)

local uiOpen = false

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

    print(('[oxe_admin] quickAction %s -> %s'):format(groupId, actionId))

    -- Para ejemplo, implementamos algunas acciones reales:
    if groupId == 'self' then
        handleSelfAction(actionId)
    elseif groupId == 'teleport' then
        handleTeleportAction(actionId)
    elseif groupId == 'server' then
        handleServerAction(actionId)
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

    lib.notify({
        title = 'Quick Admin',
        description = godmode and 'Godmode activado.' or 'Godmode desactivado.',
        type = 'success'
    })
end

local noclip = false
function toggleNoclip()
    noclip = not noclip
    local ped = PlayerPedId()
    SetEntityCollision(ped, not noclip, not noclip)
    FreezeEntityPosition(ped, noclip == false) -- truquito light
    SetEntityInvincible(ped, noclip)

    lib.notify({
        title = 'Quick Admin',
        description = noclip and 'Noclip activado (WASD, espacio, ctrl).' or 'Noclip desactivado.',
        type = 'success'
    })

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
        end)
    end
end

------------------------------------------------------------------
-- Acciones: Teleport
------------------------------------------------------------------
function handleTeleportAction(actionId)
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
        -- Más adelante: abrir un input NUI para pedir coords.
        lib.notify({
            title = 'Quick Admin',
            description = 'TP a coords aún no implementado.',
            type = 'inform'
        })

    elseif actionId == 'coords_copy_vec3' or actionId == 'coords_copy_vec4' then
        local coords = GetEntityCoords(ped)
        local heading = GetEntityHeading(ped)

        local text
        if actionId == 'coords_copy_vec3' then
            text = ("vector3(%.2f, %.2f, %.2f)"):format(coords.x, coords.y, coords.z)
        else
            text = ("vector4(%.2f, %.2f, %.2f, %.2f)"):format(coords.x, coords.y, coords.z, heading)
        end

        -- Por ahora solo mostramos, más adelante mandamos a NUI para copiar al portapapeles
        lib.notify({
            title = 'Quick Admin',
            description = 'Coordenadas: ' .. text,
            type = 'inform'
        })
        print('[oxe_admin] Coords copiadas: ' .. text)
    end
end

------------------------------------------------------------------
-- Acciones: Servidor (demo)
------------------------------------------------------------------
function handleServerAction(actionId)
    if actionId == 'srv_announce' then
        -- Aquí podrías disparar un evento server-side para anuncio global
        TriggerServerEvent('oxe_admin:server:announce')
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
    else
        lib.notify({
            title = 'Quick Admin',
            description = ('Acción vehículo no implementada: %s'):format(actionId),
            type = 'inform'
        })
    end
end
