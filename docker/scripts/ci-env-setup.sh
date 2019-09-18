#!/usr/bin/env bash

##############################################################
# FUNCTIONS declarations
##############################################################

function Print_CI_Message()
{
    printf '%*s\n' "80" '' | tr ' ' -
    echo $1
    printf '%*s\n' "80" '' | tr ' ' -
}

##############################################################
# End of FUNCTIONS declarations
##############################################################

export ENVIRONMENT=`[[ "${CI_COMMIT_REF_NAME}" == "staging" ]] && echo "staging" || echo "development"`
export ENVIRONMENT=`[[ "${CI_COMMIT_REF_NAME}" == "training" ]] && echo "training" || echo ${ENVIRONMENT}`
export ENVIRONMENT=`[[ "${CI_COMMIT_REF_NAME}" == "master" ]] && echo "production" || echo ${ENVIRONMENT}`

export -f Print_CI_Message

declare -A API_SERVER_BASE_URLS=(
    [development]='https://api.dev.steamatic.com.au'
    [staging]='https://api.staging.steamatic.com.au'
    [training]='https://api.training.steamatic.com.au'
    [production]='https://api.steamatic.com.au'
)

declare -A AZURE_CLIENT_IDS=(
    [development]='91127259-8f64-4d1a-a88f-17569b576257'
    [staging]='f268838a-fbcb-465a-a813-d5b7ed29c8ca'
    [training]='4cfdfd2c-bacc-4d6f-999f-9f7d09895b0a'
)

declare -A PUSHER_KEYS=(
    [development]='61a3751b586c8bc2f9c4'
    [staging]='c5f493ecb7b37c514291'
    [training]='783198376c359449d43e'
    [production]='050e7d1a770db95788a3'
)

export API_SERVER_BASE_URL=${API_SERVER_BASE_URLS[${ENVIRONMENT}]}
export AZURE_CLIENT_ID=${AZURE_CLIENT_IDS[${ENVIRONMENT}]}
export PUSHER_KEY=${PUSHER_KEYS[${ENVIRONMENT}]}
export PUSHER_CLUSTER="ap1"
export HELPSCOUT_BEACON_ID="70d78cd7-3591-42af-9dc2-cfaac0d4c64e"
