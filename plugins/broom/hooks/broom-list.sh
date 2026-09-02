#!/usr/bin/env bash
set -u

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

classify() {
  awk -v file="$1" '
    function ext(f,   n) { n = split(f, p, "."); return n > 1 ? tolower(p[n]) : "" }
    BEGIN {
      e = ext(file)
      base = file; sub(/.*\//, "", base)
      if (e ~ /^(md|markdown|txt|json|lock|csv|svg|png|jpg|woff|woff2)$/) exit
      hash = (e ~ /^(py|rb|sh|bash|zsh|fish|yaml|yml|toml|cfg|ini|conf|r|pl|pm|ex|exs|nix|tf|hcl|gitignore|gitattributes|env|properties)$/ || base ~ /^(Dockerfile|Makefile|Rakefile|Gemfile|Justfile|\.gitignore|\.env.*)$/)
      slash = !hash
    }
    {
      line = $0
      if (slash && line ~ /^[[:space:]]*(\/\/|\/\*|\*[[:space:]]|\*\/|<!--)/) print file ": " line
      else if (hash && line ~ /^[[:space:]]*#/ && line !~ /^#!/) print file ": " line
    }'
}

git diff HEAD -U0 --no-color --diff-filter=AM 2>/dev/null | awk '
  /^\+\+\+ b\// { file = substr($0, 7); next }
  /^\+/ && !/^\+\+\+/ { print file "\t" substr($0, 2) }' |
while IFS=$'\t' read -r file line; do
  printf '%s\n' "$line" | classify "$file"
done

git ls-files --others --exclude-standard 2>/dev/null | while read -r file; do
  [ -f "$file" ] && classify "$file" < "$file"
done
