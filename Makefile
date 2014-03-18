mocha=./node_modules/mocha/bin/_mocha
istanbul=./node_modules/.bin/istanbul

test-cov: clean
	$(istanbul) cover $(mocha) -- -R spec test/*

coveralls: 
	cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js;

clean:
	rm -fr coverage