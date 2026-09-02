#!/usr/bin/env bash
set -u

input=$(cat)
printf '%s' "$input" | grep -q '"stop_hook_active": *true' && exit 0

list=$(bash "$(dirname "$0")/broom-list.sh")
[ -z "$list" ] && exit 0

session=$(printf '%s' "$input" | sed -n 's/.*"session_id": *"\([^"]*\)".*/\1/p')
state_dir="${XDG_CACHE_HOME:-$HOME/.cache}/broom"
state="$state_dir/${session:-none}"
hash=$(printf '%s' "$list" | cksum | cut -d' ' -f1)
mkdir -p "$state_dir"
[ -f "$state" ] && [ "$(cat "$state")" = "$hash" ] && exit 0
printf '%s' "$hash" > "$state"

count=$(printf '%s\n' "$list" | wc -l | tr -d ' ')
{
  echo "broom: the working tree adds $count comment line(s). Each is a link, a platform trap, a dense regex, a directive's one-line reason, or a public contract, two lines at most, or it goes. Delete or cut each one, then stop."
  printf '%s\n' "$list" | head -60
  [ "$count" -gt 60 ] && echo "... and $((count - 60)) more"
} >&2
exit 2
