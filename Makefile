push:
	git add -A \
	&& git commit -m "$(m)" \
	&& git push origin master
init:
	git init
	git add -A 
	git remote add origin git@github.com:xinshangshangxin/DaoCloudBlog.git
	git commit -m "first"
	git push -u origin master
force:
	git add -A 
	git commit --amend --no-edit	
	git push -u origin master --force
clean:
	rm -rf .git