ifndef u
u:=root
endif

deploy:
	rsync -avhzL --delete \
				--no-perms --no-owner --no-group \
				--exclude .idea \
				--exclude .git \
				--exclude .next \
				--exclude node_modules \
				--exclude .husky \
				--exclude .env \
				--exclude .env.local \
				--exclude .env.docker \
				--exclude .env.rinkerby \
				--exclude .env.ropsten \
				--exclude .env.staging \
				--exclude dist \
				. $(u)@$(h):$(dir)
	ssh $(u)@$(h) "cd $(dir); docker build . -t mehappy-fe:latest && docker build . -f Dockerfile.seo -t mehappy-fe-seo:latest && docker compose -f docker-compose.seo.yml up -d; rm -rf src"

deploy-dev:
	make deploy h=222.255.119.48 dir=/root/mehappy-editor
