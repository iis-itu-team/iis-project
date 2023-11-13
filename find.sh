#! /bin/sh

for pid in $(ps -ef | awk '/@adonisjs/ {print $2}'); do kill -9 $pid; done

# bun install @adonisjs/auth && node ace configure @adonisjs/auth
