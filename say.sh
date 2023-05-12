#!/bin/bash
while true; do
  while read p; do
    say "$p" -v "Samantha"
  done < $1

done