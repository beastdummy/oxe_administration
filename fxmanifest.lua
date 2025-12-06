fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'oxe_administration'
author 'Adrian & ChatGPT'
description 'Panel de administración para ox_core'
version '1.0.0'

ui_page 'ui/index.html'

-- Incluimos todo el directorio NUI para evitar 404 de assets o iconos
files {
    'ui/index.html',
    'ui/**/*'
}

shared_scripts {
    '@ox_lib/init.lua'
}

client_scripts {
    'client/main.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua'
}

dependencies {
    'ox_lib',
    'oxmysql'
}