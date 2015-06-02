push:
	git add -A \
	&& git commit -m "$(m)" \
	&& git push origin master -f
init:
	git init
	git add -A 
	git remote add origin git@github.com:xinshangshangxin/DaoCloudBlog.git
	git commit -m "first"
	git push -u origin master -f
clean:
	rm -rf .git