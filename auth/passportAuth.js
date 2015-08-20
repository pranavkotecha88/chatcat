module.exports = function(passport, FacebookStrategy, config, mongoose){

	var chatUser = new mongoose.Schema({
		profileId: String,
		name: String,
		profilePic: String
	})

	var userModel = mongoose.model('chatUser', chatUser);

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	})

	passport.deserializeUser(function(id, done) {
		userModel.findById(id, function(err, user){
			done(err, user);
		})
	})

	passport.use(new FacebookStrategy({
		clientID: config.fb.appId,
		clientSecret: config.fb.appSecret,
		callbackURL : config.fb.callbackURL,
		profileFields: ['id', 'displayName', 'photos']
	}, function(accessToken, refreshToken, profile, done){
		userModel.findOne({'profileId': profile.id}, function(err, result){
			if(result) {
				done(null, result)
			} else {
				var newChatUser = new userModel({
					profileId: profile.id,
					name: profile.displayName,
					profilePic: profile.photos[0].value || ''
				})

				newChatUser.save(function(err){
					done(null, newChatUser)
					console.log('User with name: '+profile.displayName+' saved!')
				})
			}
		});
	}))
}