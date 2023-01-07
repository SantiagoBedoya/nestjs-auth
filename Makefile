generate:
	ssh-keygen -t rsa -b 4096 -m PEM -f rsa-keys/access-token.key 
	openssl rsa -in rsa-keys/access-token.key -pubout -outform PEM -out rsa-keys/access-token.key.pub