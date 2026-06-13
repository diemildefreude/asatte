<?php
require 'vendor/autoload.php';

$html = '<blockquote class="twitter-tweet" data-media-max-width="560"><p lang="en" dir="ltr">What’s that you say? You can’t concentrate on studying for the <a href="https://x.com/hashtag/JLPT?src=hash&amp;ref_src=twsrc%5Etfw">#JLPT</a> tomorrow because you are too worked up about that video of those xenophobic twats on Twitter? Worry not, mommy fixed it for you.<br><br>Now you can do BOTH at once. <a href="https://t.co/9db9F3vYg1">pic.twitter.com/9db9F3vYg1</a></p>&mdash; Gaijin Mommy (@GaijinMommy) <a href="https://x.com/GaijinMommy/status/1598908837549215744?ref_src=twsrc%5Etfw">December 3, 2022</a></blockquote> <script async src="https://platform.x.com/widgets.js" charset="utf-8"></script>';

echo sanitizeRichHtml($html) . "\n";
